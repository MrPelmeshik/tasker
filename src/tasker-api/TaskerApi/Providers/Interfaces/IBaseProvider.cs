using System.Data;

namespace TaskerApi.Providers.Interfaces;

/// <summary>
/// Базовый интерфейс провайдера
/// </summary>
/// <typeparam name="TEntity">Тип сущности</typeparam>
/// <typeparam name="TKey">Тип идентификатора</typeparam>
public interface IBaseProvider<TEntity, TKey> where TEntity : class
{
    /// <summary>
    /// Создать запись
    /// </summary>
    /// <param name="connection">Подключение к базе данных</param>
    /// <param name="entity">Объект</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="transaction">Транзакция базы данных</param>
    /// <param name="setDefaultValues">Установить значения по умолчанию</param>
    /// <returns>Идентификатор</returns>
    Task<TKey> CreateAsync(
        IDbConnection connection, 
        TEntity entity, 
        CancellationToken cancellationToken, 
        IDbTransaction? transaction = null,
        bool setDefaultValues = false);
    
    /// <summary>
    /// Создать записи
    /// </summary>
    /// <param name="connection">Подключение к базе данных</param>
    /// <param name="entities">Объекты</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="transaction">Транзакция базы данных</param>
    /// <param name="setDefaultValues">Установить значения по умолчанию</param>
    /// <returns>Список идентификаторов</returns>
    Task<IList<TKey>> CreateAsync(
        IDbConnection connection, 
        IList<TEntity> entities, 
        CancellationToken cancellationToken, 
        IDbTransaction? transaction = null,
        bool setDefaultValues = false);

    /// <summary>
    /// Получить по идентификатору
    /// </summary>
    /// <param name="connection">Подключение к базе данных</param>
    /// <param name="id">Идентификатор</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="transaction">Транзакция базы данных</param>
    /// <returns>Объект</returns>
    Task<TEntity?> GetByIdAsync(
        IDbConnection connection, 
        TKey id, 
        CancellationToken cancellationToken, 
        IDbTransaction? transaction = null);

    /// <summary>
    /// Получить список с пагинацией и простым фильтром
    /// </summary>
    /// <param name="connection">Подключение к базе данных</param>
    /// <param name="offset">Смещение для пагинации</param>
    /// <param name="limit">Количество записей</param>
    /// <param name="search">Строка поиска</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="transaction">Транзакция базы данных</param>
    /// <returns>Список объектов</returns>
    Task<IReadOnlyList<TEntity>> GetListAsync(
        IDbConnection connection, 
        CancellationToken cancellationToken,
        int? offset = null,
        int? limit = null,
        string? search = null,
        IDbTransaction? transaction = null);

    /// <summary>
    /// Обновить запись
    /// </summary>
    /// <param name="connection">Подключение к базе данных</param>
    /// <param name="entity">Объект</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="transaction">Транзакция базы данных</param>
    /// <param name="setDefaultValues">Установить значения по умолчанию</param>
    /// <returns>Количество обновленных записей</returns>
    Task<int> UpdateAsync(
        IDbConnection connection, 
        TEntity entity, 
        CancellationToken cancellationToken, 
        IDbTransaction? transaction = null,
        bool setDefaultValues = false);

    /// <summary>
    /// Удалить запись
    /// </summary>
    /// <param name="connection">Подключение к базе данных</param>
    /// <param name="id">Идентификатор</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="transaction">Транзакция базы данных</param>
    /// <returns>Количество удаленных записей</returns>
    Task<int> DeleteAsync(
        IDbConnection connection, 
        TKey id, 
        CancellationToken cancellationToken, 
        IDbTransaction? transaction = null);

    /// <summary>
    /// Удалить записи
    /// </summary>
    /// <param name="connection">Подключение к базе данных</param>
    /// <param name="ids">Идентификаторы</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="transaction">Транзакция базы данных</param>
    /// <returns>Количество удаленных записей</returns>
    Task<int> DeleteAsync(
        IDbConnection connection, 
        IList<TKey> ids, 
        CancellationToken cancellationToken, 
        IDbTransaction? transaction = null);
}



