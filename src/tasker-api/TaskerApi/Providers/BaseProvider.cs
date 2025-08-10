using System.Data;
using Microsoft.Extensions.Logging;
using TaskerApi.Interfaces.Providers;

namespace TaskerApi.Providers;

/// <summary>
/// Базовый класс для всех провайдеров с общей функциональностью.
/// </summary>
/// <typeparam name="TEntity">Тип сущности</typeparam>
/// <typeparam name="TId">Тип идентификатора</typeparam>
public abstract class BaseProvider<TEntity, TId> : BaseProvider, ICrudProvider<TEntity, TId>
{
    /// <summary>
    /// Создает новый экземпляр базового провайдера.
    /// </summary>
    /// <param name="logger">Логгер для записи информации</param>
    protected BaseProvider(ILogger logger) : base(logger)
    {
    }

    /// <summary>
    /// Получить сущность по идентификатору.
    /// </summary>
    /// <param name="id">Идентификатор сущности</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="connection">Подключение к БД</param>
    /// <returns>Сущность или null, если не найдена</returns>
    public abstract Task<TEntity?> GetByIdAsync(TId id, CancellationToken cancellationToken, IDbConnection connection);

    /// <summary>
    /// Создать новую сущность.
    /// </summary>
    /// <param name="entity">Сущность для создания</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="connection">Подключение к БД</param>
    /// <returns>Идентификатор созданной сущности</returns>
    public abstract Task<TId> InsertAsync(TEntity entity, CancellationToken cancellationToken, IDbConnection connection);

    /// <summary>
    /// Обновить существующую сущность.
    /// </summary>
    /// <param name="entity">Сущность для обновления</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="connection">Подключение к БД</param>
    /// <returns>Количество затронутых строк</returns>
    public abstract Task<int> UpdateAsync(TEntity entity, CancellationToken cancellationToken, IDbConnection connection);
}

/// <summary>
/// Базовый класс для всех провайдеров с общей функциональностью.
/// </summary>
public abstract class BaseProvider
{
    /// <summary>
    /// Логгер для записи информации о выполнении операций.
    /// </summary>
    protected readonly ILogger Logger;

    /// <summary>
    /// Создает новый экземпляр базового провайдера.
    /// </summary>
    /// <param name="logger">Логгер для записи информации</param>
    protected BaseProvider(ILogger logger)
    {
        Logger = logger;
    }

    /// <summary>
    /// Проверяет валидность подключения к БД.
    /// </summary>
    /// <param name="connection">Подключение для проверки</param>
    /// <exception cref="ArgumentNullException">Выбрасывается, если подключение равно null</exception>
    /// <exception cref="InvalidOperationException">Выбрасывается, если подключение не открыто</exception>
    protected static void EnsureValidConnection(IDbConnection connection)
    {
        if (connection is null)
            throw new ArgumentNullException(nameof(connection), "Подключение к БД не может быть null для выполнения операции");
        
        if (connection.State != ConnectionState.Open)
            throw new InvalidOperationException("Подключение к БД должно быть открытым для выполнения операции");
    }
}
