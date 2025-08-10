namespace TaskerApi.Models.Entities;

/// <summary>
/// Связь действия и задачи (таблица action_task).
/// </summary>
public class ActionTaskEntity
{
    /// <summary>
    /// Идентификатор связи.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Идентификатор действия.
    /// </summary>
    public Guid ActionId { get; init; }

    /// <summary>
    /// Идентификатор задачи.
    /// </summary>
    public Guid TaskId { get; init; }

    /// <summary>
    /// Идентификатор типа связи (relation_kind_ref).
    /// </summary>
    public int RelationKindId { get; set; }

    /// <summary>
    /// Время создания записи.
    /// </summary>
    public DateTimeOffset Created { get; set; }

    /// <summary>
    /// Признак активности записи.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Время деактивации записи (если применимо).
    /// </summary>
    public DateTimeOffset? Deactivated { get; set; }
}
