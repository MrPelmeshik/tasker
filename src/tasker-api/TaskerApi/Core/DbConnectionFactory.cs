using System.Data;
using Microsoft.Extensions.Options;
using Npgsql;
using TaskerApi.Core.Interfaces;
using TaskerApi.Models.Common;

namespace TaskerApi.Core.Implementations;

/// <summary>
/// Реализация фабрики подключений к PostgreSQL через Npgsql.
/// </summary>
public class DbConnectionFactory : IDbConnectionFactory
{
    /// <summary>
    /// Строка подключения к базе данных PostgreSQL.
    /// </summary>
    private readonly string _connectionString;

    /// <summary>
    /// Создаёт новый экземпляр фабрики подключений.
    /// </summary>
    /// <param name="databaseSettings">Настройки базы данных.</param>
    public DbConnectionFactory(IOptions<DatabaseSettings> databaseSettings)
    {
        _connectionString = ExpandEnvironmentVariables(databaseSettings.Value.ConnectionString)
            ?? throw new InvalidOperationException("Database connection string is missing. Ensure 'Database:ConnectionString' is configured and required environment variables are set.");
    }

    /// <inheritdoc />
    public IDbConnection Create()
    {
        // ВАЖНО: Подключение возвращается закрытым. Потребитель сам управляет жизненным циклом.
        return new NpgsqlConnection(_connectionString);
    }

    /// <summary>
    /// Создать и открыть подключение к базе данных.
    /// </summary>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Открытое подключение к базе данных</returns>
    public async Task<IDbConnection> CreateOpenAsync(CancellationToken cancellationToken)
    {
        var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync(cancellationToken);
        return connection;
    }

    /// <summary>
    /// Расширяет переменные окружения в строке подключения.
    /// Поддерживает форматы %VAR%, $VAR и ${VAR}.
    /// </summary>
    /// <param name="value">Строка с переменными окружения</param>
    /// <returns>Строка с подставленными значениями переменных</returns>
    private static string ExpandEnvironmentVariables(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) return value;
        // Поддержка форматов %VAR%, $VAR и ${VAR}
        var expanded = Environment.ExpandEnvironmentVariables(value);
        // Ручная подстановка для ${VAR}
        int start = 0;
        while (true)
        {
            var open = expanded.IndexOf("${", start, StringComparison.Ordinal);
            if (open < 0) break;
            var close = expanded.IndexOf('}', open + 2);
            if (close < 0) break;
            var name = expanded.Substring(open + 2, close - open - 2);
            var env = Environment.GetEnvironmentVariable(name) ?? string.Empty;
            expanded = expanded[..open] + env + expanded[(close + 1)..];
            start = open + env.Length;
        }
        return expanded;
    }
}


