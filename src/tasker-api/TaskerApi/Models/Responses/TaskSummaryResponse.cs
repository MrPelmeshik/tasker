using TaskerApi.Models.Common;
using TaskStatus = TaskerApi.Models.Common.TaskStatus;

namespace TaskerApi.Models.Responses;

/// <summary>
/// Краткая информация о задаче
/// </summary>
public class TaskSummaryResponse
{
    /// <summary>
    /// Идентификатор задачи
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Заголовок задачи
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Описание задачи
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Статус задачи
    /// </summary>
    public TaskStatus Status { get; set; }

    /// <summary>
    /// ID группы
    /// </summary>
    public Guid GroupId { get; set; }

    /// <summary>
    /// ID создателя
    /// </summary>
    public Guid CreatorUserId { get; set; }

    /// <summary>
    /// Имя пользователя-создателя.
    /// </summary>
    public string CreatorUserName { get; set; } = string.Empty;

    /// <summary>
    /// Дата создания
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Дата обновления
    /// </summary>
    public DateTimeOffset UpdatedAt { get; set; }

    /// <summary>
    /// Признак активности
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Дата деактивации
    /// </summary>
    public DateTimeOffset? DeactivatedAt { get; set; }
}
