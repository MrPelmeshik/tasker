using System.Data;
using TaskerApi.Interfaces.Core;

namespace TaskerApi.Core;

/// <summary>
/// Фабрика Unit of Work, создающая открытое подключение и, при необходимости, транзакцию.
/// </summary>
public sealed class UnitOfWorkFactory : IUnitOfWorkFactory
{
    /// <summary>
    /// Фабрика для создания подключений к базе данных.
    /// </summary>
    private readonly IDbConnectionFactory _connectionFactory;

    /// <summary>
    /// Создает новый экземпляр фабрики Unit of Work.
    /// </summary>
    /// <param name="connectionFactory">Фабрика для создания подключений</param>
    public UnitOfWorkFactory(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    /// <inheritdoc />
    public async Task<IUnitOfWork> CreateAsync(CancellationToken cancellationToken, bool useTransaction = false)
    {
        var connection = await _connectionFactory.CreateOpenAsync(cancellationToken);
        IDbTransaction? tx = null;
        if (useTransaction)
        {
            tx = connection.BeginTransaction();
        }
        return new UnitOfWork(connection, tx);
    }
}


