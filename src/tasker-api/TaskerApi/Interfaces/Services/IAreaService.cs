using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Сервис для управления областями.
/// </summary>
public interface IAreaService : ICrudService<AreaEntity, Guid>
{
    /// <summary>
    /// Получить области по пользователю.
    /// </summary>
    /// <param name="userId">Идентификатор пользователя</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Список областей</returns>
    Task<IEnumerable<AreaEntity>> GetByUserAsync(Guid userId, CancellationToken cancellationToken);

    /// <summary>
    /// Получить активные области.
    /// </summary>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Список активных областей</returns>
    Task<IEnumerable<AreaEntity>> GetActiveAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Деактивировать область.
    /// </summary>
    /// <param name="id">Идентификатор области</param>
    /// <param name="cancellationToken">Токен отмены</param>
    Task DeactivateAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Активировать область.
    /// </summary>
    /// <param name="id">Идентификатор области</param>
    /// <param name="cancellationToken">Токен отмены</param>
    Task ActivateAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Получить статистику по области.
    /// </summary>
    /// <param name="id">Идентификатор области</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Статистика области</returns>
    Task<AreaStatistics> GetStatisticsAsync(Guid id, CancellationToken cancellationToken);
}

/// <summary>
/// Статистика области.
/// </summary>
public class AreaStatistics
{
    /// <summary>
    /// Количество задач.
    /// </summary>
    public int TasksCount { get; set; }

    /// <summary>
    /// Количество действий.
    /// </summary>
    public int ActionsCount { get; set; }

    /// <summary>
    /// Количество участников.
    /// </summary>
    public int MembersCount { get; set; }

    /// <summary>
    /// Общее время, потраченное на задачи.
    /// </summary>
    public int TotalSpentSeconds { get; set; }
}


