namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Универсальный интерфейс для CRUD сервисов.
/// </summary>
/// <typeparam name="TEntity">Тип сущности</typeparam>
/// <typeparam name="TId">Тип идентификатора</typeparam>
public interface ICrudService<TEntity, TId>
{
    /// <summary>
    /// Получить сущность по идентификатору.
    /// </summary>
    /// <param name="id">Идентификатор</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Сущность или null</returns>
    Task<TEntity?> GetAsync(TId id, CancellationToken cancellationToken);

    /// <summary>
    /// Создать новую сущность.
    /// </summary>
    /// <param name="entity">Сущность для создания</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Идентификатор созданной сущности</returns>
    Task<TId> CreateAsync(TEntity entity, CancellationToken cancellationToken);

    /// <summary>
    /// Обновить существующую сущность.
    /// </summary>
    /// <param name="entity">Сущность для обновления</param>
    /// <param name="cancellationToken">Токен отмены</param>
    Task UpdateAsync(TEntity entity, CancellationToken cancellationToken);
}
