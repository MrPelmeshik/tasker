using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Интерфейс сервиса для управления связями между действиями и тегами.
/// </summary>
public interface IActionTagService
{
    /// <summary>
    /// Добавить тег к действию.
    /// </summary>
    Task AddTagToActionAsync(Guid actionId, Guid tagId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Убрать тег с действия.
    /// </summary>
    Task RemoveTagFromActionAsync(Guid actionId, Guid tagId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить все теги действия.
    /// </summary>
    Task<IEnumerable<TagEntity>> GetTagsForActionAsync(Guid actionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить все действия с определенным тегом.
    /// </summary>
    Task<IEnumerable<ActionEntity>> GetActionsByTagAsync(Guid tagId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить статистику по тегу.
    /// </summary>
    Task<TagStatistics> GetTagStatisticsAsync(Guid tagId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить популярные теги в области.
    /// </summary>
    Task<IEnumerable<TagUsage>> GetPopularTagsInAreaAsync(Guid areaId, int limit = 10, CancellationToken cancellationToken = default);
}

/// <summary>
/// Статистика по тегу.
/// </summary>
public class TagStatistics
{
    public Guid TagId { get; set; }
    public int ActionsCount { get; set; }
    public int TotalDurationSec { get; set; }
    public int UniqueUsersCount { get; set; }
}

/// <summary>
/// Использование тега.
/// </summary>
public class TagUsage
{
    public Guid TagId { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string? Label { get; set; }
    public int UsageCount { get; set; }
}
