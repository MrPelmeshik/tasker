using System.Data;

namespace TaskerApi.Interfaces.Core;

/// <summary>
/// Фабрика подключений к базе данных.
/// </summary>
public interface IDbConnectionFactory
{
    /// <summary>
    /// Создать и вернуть новое подключение к базе данных.
    /// </summary>
    IDbConnection Create();

    /// <summary>
    /// Создать подключение и открыть его асинхронно, возвращая уже открытое соединение.
    /// </summary>
    Task<IDbConnection> CreateOpenAsync(CancellationToken cancellationToken);
}


