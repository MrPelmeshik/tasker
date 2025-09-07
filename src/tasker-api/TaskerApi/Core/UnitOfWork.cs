using System.Data;
using System.Data.Common;
using TaskerApi.Core.Interfaces;

namespace TaskerApi.Core.Implementations;

/// <summary>
/// Реализация Unit of Work с поддержкой транзакции.
/// </summary>
public sealed class UnitOfWork : IUnitOfWork
{
    /// <summary>
    /// Подключение к базе данных.
    /// </summary>
    private readonly IDbConnection _connection;
    
    /// <summary>
    /// Транзакция базы данных.
    /// </summary>
    private readonly IDbTransaction? _transaction;

    /// <summary>
    /// Создает новый экземпляр Unit of Work.
    /// </summary>
    /// <param name="connection">Подключение к базе данных</param>
    /// <param name="transaction">Транзакция базы данных</param>
    public UnitOfWork(IDbConnection connection, IDbTransaction? transaction)
    {
        _connection = connection;
        _transaction = transaction;
    }

    /// <inheritdoc />
    public IDbConnection Connection => _connection;
    
    /// <inheritdoc />
    public IDbTransaction? Transaction => _transaction;

    /// <inheritdoc />
    public Task CommitAsync(CancellationToken cancellationToken)
    {
        _transaction?.Commit();
        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public Task RollbackAsync(CancellationToken cancellationToken)
    {
        _transaction?.Rollback();
        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public async ValueTask DisposeAsync()
    {
        try
        {
            _transaction?.Dispose();
        }
        finally
        {
            await ((DbConnection)_connection).DisposeAsync();
        }
    }
}


