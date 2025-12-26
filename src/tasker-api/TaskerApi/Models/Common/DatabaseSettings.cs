namespace TaskerApi.Models.Common;

/// <summary>
/// Настройки подключения к базе данных PostgreSQL.
/// </summary>
public class DatabaseSettings
{
    /// <summary>
    /// Строка подключения к базе данных.
    /// </summary>
    public string ConnectionString { get; init; } = string.Empty;
}


