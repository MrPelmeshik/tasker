using System.Data;
using Microsoft.Extensions.Logging;
using TaskerApi.Interfaces.Infrastructure;
using TaskerApi.Interfaces.Providers;

namespace TaskerApi.Services;

/// <summary>
/// Базовый класс для всех сервисов с общей функциональностью.
/// </summary>
/// <typeparam name="TEntity">Тип сущности</typeparam>
/// <typeparam name="TId">Тип идентификатора</typeparam>
public abstract class BaseService<TEntity, TId> : BaseService
{
    /// <summary>
    /// Провайдер для работы с сущностями.
    /// </summary>
    protected readonly ICrudProvider<TEntity, TId> Provider;

    /// <summary>
    /// Создает новый экземпляр базового сервиса.
    /// </summary>
    /// <param name="logger">Логгер для записи информации</param>
    /// <param name="uowFactory">Фабрика для создания Unit of Work</param>
    /// <param name="provider">Провайдер для работы с сущностями</param>
    protected BaseService(ILogger logger, IUnitOfWorkFactory uowFactory, ICrudProvider<TEntity, TId> provider) 
        : base(logger, uowFactory)
    {
        Provider = provider;
    }

    /// <summary>
    /// Получить сущность по идентификатору.
    /// </summary>
    /// <param name="id">Идентификатор</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Сущность или null</returns>
    public virtual async Task<TEntity?> GetByIdAsync(TId id, CancellationToken cancellationToken = default)
    {
        return await ExecuteWithoutTransactionAsync(async connection => 
            await Provider.GetByIdAsync(id, cancellationToken, connection), cancellationToken);
    }

    /// <summary>
    /// Создать новую сущность.
    /// </summary>
    /// <param name="entity">Сущность для создания</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Идентификатор созданной сущности</returns>
    public virtual async Task<TId> CreateAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        return await ExecuteInTransactionAsync(async connection => 
            await Provider.InsertAsync(entity, cancellationToken, connection), cancellationToken);
    }

    /// <summary>
    /// Обновить существующую сущность.
    /// </summary>
    /// <param name="entity">Сущность для обновления</param>
    /// <param name="cancellationToken">Токен отмены</param>
    public virtual async Task UpdateAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        await ExecuteInTransactionAsync(async connection => 
            await Provider.UpdateAsync(entity, cancellationToken, connection), cancellationToken);
    }

    /// <summary>
    /// Удалить сущность по идентификатору.
    /// </summary>
    /// <param name="id">Идентификатор</param>
    /// <param name="cancellationToken">Токен отмены</param>
    public virtual async Task DeleteAsync(TId id, CancellationToken cancellationToken = default)
    {
        // Реализация удаления зависит от конкретного провайдера
        throw new NotImplementedException("Метод DeleteAsync должен быть переопределен в наследниках");
    }
}

/// <summary>
/// Базовый класс для всех сервисов с общей функциональностью.
/// </summary>
public abstract class BaseService
{
    /// <summary>
    /// Логгер для записи информации о выполнении операций.
    /// </summary>
    protected readonly ILogger Logger;
    
    /// <summary>
    /// Фабрика для создания единиц работы (Unit of Work).
    /// </summary>
    protected readonly IUnitOfWorkFactory UowFactory;

    /// <summary>
    /// Создает новый экземпляр базового сервиса.
    /// </summary>
    /// <param name="logger">Логгер для записи информации</param>
    /// <param name="uowFactory">Фабрика для создания Unit of Work</param>
    protected BaseService(ILogger logger, IUnitOfWorkFactory uowFactory)
    {
        Logger = logger;
        UowFactory = uowFactory;
    }

    /// <summary>
    /// Выполняет операцию без транзакции, используя только подключение.
    /// </summary>
    /// <typeparam name="T">Тип возвращаемого значения</typeparam>
    /// <param name="operation">Операция для выполнения</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Результат операции</returns>
    protected async Task<T> ExecuteWithoutTransactionAsync<T>(Func<IDbConnection, Task<T>> operation, CancellationToken cancellationToken)
    {
        await using var uow = await UowFactory.CreateAsync(cancellationToken, useTransaction: false);
        return await operation(uow.Connection);
    }

    /// <summary>
    /// Выполняет операцию в транзакции с автоматическим коммитом/откатом.
    /// </summary>
    /// <typeparam name="T">Тип возвращаемого значения</typeparam>
    /// <param name="operation">Операция для выполнения</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Результат операции</returns>
    protected async Task<T> ExecuteInTransactionAsync<T>(Func<IDbConnection, Task<T>> operation, CancellationToken cancellationToken)
    {
        await using var uow = await UowFactory.CreateAsync(cancellationToken, useTransaction: true);
        try
        {
            var result = await operation(uow.Connection);
            await uow.CommitAsync(cancellationToken);
            return result;
        }
        catch
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }

    /// <summary>
    /// Выполняет операцию в транзакции без возвращаемого значения.
    /// </summary>
    /// <param name="operation">Операция для выполнения</param>
    /// <param name="cancellationToken">Токен отмены</param>
    protected async Task ExecuteInTransactionAsync(Func<IDbConnection, Task> operation, CancellationToken cancellationToken)
    {
        await using var uow = await UowFactory.CreateAsync(cancellationToken, useTransaction: true);
        try
        {
            await operation(uow.Connection);
            await uow.CommitAsync(cancellationToken);
        }
        catch
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
