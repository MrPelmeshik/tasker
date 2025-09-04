using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Entities;

namespace TaskerApi.Models.Entities;

/// <summary>
///     Связь события и подзадачи
/// </summary>
[Table("events_2_subtask")]
public class EventToSubtaskEntity : ICreatorUserBaseEntity, ICreatedDateBaseEntity, IUpdatedDateBaseEntity,
    ISoftDeleteBaseEntity
{
    /// <summary>
    ///     ID события
    /// </summary>
    [Column("event_id")]
    public Guid EventId { get; set; }

    /// <summary>
    ///     ID подзадачи
    /// </summary>
    [Column("subtask_id")]
    public Guid SubtaskId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public Guid CreatorUserId { get; set; }

    public DateTimeOffset? DeactivatedAt { get; set; }

    public bool IsActive { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}