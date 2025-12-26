using TaskerApi.Interfaces.Models.Entities;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;

namespace TaskerApi.Services.Base;

/// <summary>
/// Базовый сервис для CRUD операций
/// </summary>
/// <typeparam name="TEntity">Тип сущности</typeparam>
/// <typeparam name="TKey">Тип ключа</typeparam>
public abstract class BaseCrudService<TEntity, TKey> : BaseService
    where TEntity : class, IIdBaseEntity<TKey>
{
    protected readonly IRepository<TEntity, TKey> Repository;

    protected BaseCrudService(
        IRepository<TEntity, TKey> repository,
        ILogger logger,
        ICurrentUserService currentUser) : base(logger, currentUser)
    {
        Repository = repository;
    }

    /// <summary>
    /// Получить все записи
    /// </summary>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Список всех записей</returns>
    protected virtual async Task<IEnumerable<TEntity>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await ExecuteWithErrorHandling(
            () => Repository.GetAllAsync(cancellationToken),
            nameof(GetAllAsync));
    }

    /// <summary>
    /// Получить запись по идентификатору
    /// </summary>
    /// <param name="id">Идентификатор записи</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Запись или null, если не найдена</returns>
    protected virtual async Task<TEntity?> GetByIdAsync(TKey id, CancellationToken cancellationToken = default)
    {
        return await ExecuteWithErrorHandling(
            () => Repository.GetByIdAsync(id, cancellationToken),
            nameof(GetByIdAsync),
            new { id });
    }

    /// <summary>
    /// Создать новую запись
    /// </summary>
    /// <param name="entity">Сущность для создания</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Созданная запись</returns>
    protected virtual async Task<TEntity> CreateAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        return await ExecuteWithErrorHandling(
            () => Repository.CreateAsync(entity, cancellationToken),
            nameof(CreateAsync),
            entity);
    }

    /// <summary>
    /// Обновить запись
    /// </summary>
    /// <param name="entity">Сущность для обновления</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Обновленная запись</returns>
    protected virtual async Task<TEntity> UpdateAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        return await ExecuteWithErrorHandling(
            () => Repository.UpdateAsync(entity, cancellationToken),
            nameof(UpdateAsync),
            entity);
    }

    /// <summary>
    /// Удалить запись
    /// </summary>
    /// <param name="id">Идентификатор записи</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    protected virtual async Task DeleteAsync(TKey id, CancellationToken cancellationToken = default)
    {
        await ExecuteWithErrorHandling(
            () => Repository.DeleteAsync(id, cancellationToken),
            nameof(DeleteAsync),
            new { id });
    }
}
