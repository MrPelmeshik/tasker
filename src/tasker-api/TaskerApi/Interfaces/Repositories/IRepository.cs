using System.Linq.Expressions;
using TaskerApi.Interfaces.Models.Entities;

namespace TaskerApi.Interfaces.Repositories;

/// <summary>
/// Базовый интерфейс репозитория для работы с сущностями
/// </summary>
/// <typeparam name="TEntity">Тип сущности</typeparam>
/// <typeparam name="TKey">Тип ключа</typeparam>
public interface IRepository<TEntity, TKey> where TEntity : class, IIdBaseEntity<TKey>
{
    /// <summary>
    /// Получить все записи
    /// </summary>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Список записей</returns>
    Task<IReadOnlyList<TEntity>> GetAllAsync(CancellationToken cancellationToken = default, bool includeDeleted = false);

    /// <summary>
    /// Получить запись по идентификатору
    /// </summary>
    /// <param name="id">Идентификатор</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Запись или null</returns>
    Task<TEntity?> GetByIdAsync(TKey id, CancellationToken cancellationToken = default, bool includeDeleted = false);

    /// <summary>
    /// Найти записи по условию
    /// </summary>
    /// <param name="predicate">Условие поиска</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Список записей</returns>
    Task<IReadOnlyList<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default, bool includeDeleted = false);

    /// <summary>
    /// Найти первую запись по условию
    /// </summary>
    /// <param name="predicate">Условие поиска</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Запись или null</returns>
    Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default, bool includeDeleted = false);

    /// <summary>
    /// Создать запись
    /// </summary>
    /// <param name="entity">Сущность</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="setDefaultValues">Установить значения по умолчанию</param>
    /// <returns>Созданная сущность</returns>
    Task<TEntity> CreateAsync(TEntity entity, CancellationToken cancellationToken = default, bool setDefaultValues = true);

    /// <summary>
    /// Создать несколько записей
    /// </summary>
    /// <param name="entities">Список сущностей</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="setDefaultValues">Установить значения по умолчанию</param>
    /// <returns>Список созданных сущностей</returns>
    Task<IList<TEntity>> CreateAsync(IList<TEntity> entities, CancellationToken cancellationToken = default, bool setDefaultValues = true);

    /// <summary>
    /// Обновить запись
    /// </summary>
    /// <param name="entity">Сущность</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="setDefaultValues">Установить значения по умолчанию</param>
    /// <returns>Обновленная сущность</returns>
    Task<TEntity> UpdateAsync(TEntity entity, CancellationToken cancellationToken = default, bool setDefaultValues = true);

    /// <summary>
    /// Удалить запись
    /// </summary>
    /// <param name="id">Идентификатор</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="hardDelete">Физическое удаление</param>
    /// <returns>Количество удаленных записей</returns>
    Task<int> DeleteAsync(TKey id, CancellationToken cancellationToken = default, bool hardDelete = false);

    /// <summary>
    /// Удалить несколько записей
    /// </summary>
    /// <param name="ids">Список идентификаторов</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="hardDelete">Физическое удаление</param>
    /// <returns>Количество удаленных записей</returns>
    Task<int> DeleteAsync(IList<TKey> ids, CancellationToken cancellationToken = default, bool hardDelete = false);

    /// <summary>
    /// Получить количество записей
    /// </summary>
    /// <param name="predicate">Условие</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Количество записей</returns>
    Task<int> CountAsync(Expression<Func<TEntity, bool>>? predicate = null, CancellationToken cancellationToken = default, bool includeDeleted = false);

    /// <summary>
    /// Проверить существование записи
    /// </summary>
    /// <param name="predicate">Условие</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>True если запись существует</returns>
    Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default, bool includeDeleted = false);
}
