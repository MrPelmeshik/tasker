using System.Data;

namespace TaskerApi.Interfaces.Infrastructure;

/// <summary>
/// Единица работы (Unit of Work), инкапсулирующая подключение и транзакцию.
/// </summary>
public interface IUnitOfWork : IAsyncDisposable
{
    /// <summary>
    /// Текущее подключение к базе данных.
    /// </summary>
    IDbConnection Connection { get; }

    /// <summary>
    /// Текущая транзакция, если открыта.
    /// </summary>
    IDbTransaction? Transaction { get; }

    /// <summary>
    /// Подтвердить транзакцию.
    /// </summary>
    Task CommitAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Откатить транзакцию.
    /// </summary>
    Task RollbackAsync(CancellationToken cancellationToken);
}


