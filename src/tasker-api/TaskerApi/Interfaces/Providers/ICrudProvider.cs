using System.Data;

namespace TaskerApi.Interfaces.Providers;

/// <summary>
/// Универсальный интерфейс для CRUD операций.
/// </summary>
/// <typeparam name="TEntity">Тип сущности</typeparam>
/// <typeparam name="TId">Тип идентификатора</typeparam>
public interface ICrudProvider<TEntity, TId>
{
    /// <summary>
    /// Получить сущность по идентификатору.
    /// </summary>
    /// <param name="id">Идентификатор сущности</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="connection">Подключение к БД</param>
    /// <returns>Сущность или null, если не найдена</returns>
    Task<TEntity?> GetByIdAsync(TId id, CancellationToken cancellationToken, IDbConnection connection);

    /// <summary>
    /// Создать новую сущность.
    /// </summary>
    /// <param name="entity">Сущность для создания</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="connection">Подключение к БД</param>
    /// <returns>Идентификатор созданной сущности</returns>
    Task<TId> InsertAsync(TEntity entity, CancellationToken cancellationToken, IDbConnection connection);

    /// <summary>
    /// Обновить существующую сущность.
    /// </summary>
    /// <param name="entity">Сущность для обновления</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="connection">Подключение к БД</param>
    /// <returns>Количество затронутых строк</returns>
    Task<int> UpdateAsync(TEntity entity, CancellationToken cancellationToken, IDbConnection connection);
}
