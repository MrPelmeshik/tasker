using System.Data;
using TaskerApi.Interfaces.Models.Common;
using TaskerApi.Models.Common;
using TaskerApi.Models.Common.SqlFilters;

namespace TaskerApi.Interfaces.Providers;

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
    /// Получить список с пагинацией и фильтром
    /// </summary>
    /// <param name="connection">Подключение к базе данных</param>
    /// <param name="filers">Фильтры</param>
    /// <param name="withDeleted">Включить удалённые (если доступен SoftDelete)</param>
    /// <param name="orderColumn">Сортировка</param>
    /// <param name="orderDesc">Сортировка по убыванию</param>
    /// <param name="offset">Смещение для пагинации</param>
    /// <param name="limit">Количество записей</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="transaction">Транзакция базы данных</param>
    /// <returns>Список объектов</returns>
    Task<IReadOnlyList<TEntity>> GetListAsync(
        IDbConnection connection, 
        CancellationToken cancellationToken, 
        IList<IFilter>? filers = null,
        bool withDeleted = false,
        string? orderColumn = null,
        bool orderDesc = false,
        int? offset = null, 
        int? limit = null, 
        IDbTransaction? transaction = null);

    /// <summary>
    /// Получить одну запись
    /// </summary>
    /// <param name="connection">Подключение к базе данных</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="filers">Фильтры</param>
    /// <param name="withDeleted">Включить удалённые (если доступен SoftDelete)</param>
    /// <param name="orderColumn">Сортировка</param>
    /// <param name="orderDesc">Сортировка по убыванию</param>
    /// <param name="checkOnlyOne">Проверять чтобы была только одна запись</param>
    /// <param name="transaction">Транзакция базы данных</param>
    /// <returns>Объект</returns>
    Task<TEntity?> GetSimpleAsync(
        IDbConnection connection, 
        CancellationToken cancellationToken, 
        IList<IFilter>? filers = null,
        bool withDeleted = false,
        string? orderColumn = null,
        bool orderDesc = false,
        bool checkOnlyOne = false,
        IDbTransaction? transaction = null);

    /// <summary>
    /// Получить запись по идентификатору
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
        IList<IFilter>? filers = null,
        IDbTransaction? transaction = null
    );

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
        IList<IFilter>? filers = null,
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
        IList<IFilter>? filers = null,
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
        IList<IFilter>? filers = null,
        IDbTransaction? transaction = null);
}



