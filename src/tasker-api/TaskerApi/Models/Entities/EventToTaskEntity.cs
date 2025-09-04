using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Entities;

namespace TaskerApi.Models.Entities;

/// <summary>
///     Связь события и задачи
/// </summary>
[Table("events_2_task")]
public class EventToTaskEntity : 
    IDbEntity,
    ICreatorUserBaseEntity, 
    ICreatedDateBaseEntity, 
    IUpdatedDateBaseEntity,
    ISoftDeleteBaseEntity
{
    /// <summary>
    ///     ID события
    /// </summary>
    [Column("event_id")]
    public Guid EventId { get; set; }

    /// <summary>
    ///     ID задачи
    /// </summary>
    [Column("task_id")]
    public Guid TaskId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public Guid CreatorUserId { get; set; }

    public DateTimeOffset? DeactivatedAt { get; set; }

    public bool IsActive { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}