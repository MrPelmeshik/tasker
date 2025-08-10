namespace TaskerApi.Models.Entities;

/// <summary>
/// Задача (таблица tasks).
/// </summary>
public class TaskEntity
{
    /// <summary>
    /// Идентификатор задачи.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Идентификатор области.
    /// </summary>
    public Guid AreaId { get; init; }

    /// <summary>
    /// Заголовок задачи.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Описание задачи.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Идентификатор статуса (task_status_ref).
    /// </summary>
    public int StatusId { get; set; }

    /// <summary>
    /// Идентификатор видимости (visibility_ref).
    /// </summary>
    public int VisibilityId { get; set; }

    /// <summary>
    /// Идентификатор пользователя — создателя.
    /// </summary>
    public Guid UserId { get; init; }

    /// <summary>
    /// Время создания записи.
    /// </summary>
    public DateTimeOffset Created { get; set; }

    /// <summary>
    /// Время последнего обновления записи.
    /// </summary>
    public DateTimeOffset Updated { get; set; }

    /// <summary>
    /// Время закрытия задачи (если закрыта).
    /// </summary>
    public DateTimeOffset? Closed { get; init; }

    /// <summary>
    /// Признак активности записи.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Время деактивации записи (если применимо).
    /// </summary>
    public DateTimeOffset? Deactivated { get; init; }
}


