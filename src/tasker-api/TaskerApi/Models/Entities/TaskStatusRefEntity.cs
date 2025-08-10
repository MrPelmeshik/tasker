namespace TaskerApi.Models.Entities;

/// <summary>
/// Справочник статусов задач (таблица task_status_ref).
/// </summary>
public class TaskStatusRefEntity
{
    /// <summary>
    /// Идентификатор статуса.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Машиночитаемый код статуса.
    /// </summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>
    /// Читаемая метка статуса.
    /// </summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>
    /// Признак активности записи.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Дата деактивации (если применимо).
    /// </summary>
    public DateTimeOffset? Deactivated { get; set; }

    /// <summary>
    /// Время создания записи.
    /// </summary>
    public DateTimeOffset Created { get; set; }

    /// <summary>
    /// Время последнего обновления записи.
    /// </summary>
    public DateTimeOffset Updated { get; set; }
}


