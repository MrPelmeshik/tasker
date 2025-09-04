using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Entities;

namespace TaskerApi.Models.Entities;

/// <summary>
///     Связь события и группы
/// </summary>
[Table("events_2_group")]
public class EventToGroupEntity : ICreatorUserBaseEntity, ICreatedDateBaseEntity, IUpdatedDateBaseEntity,
    ISoftDeleteBaseEntity
{
    /// <summary>
    ///     ID события
    /// </summary>
    [Column("event_id")]
    public Guid EventId { get; set; }

    /// <summary>
    ///     ID группы
    /// </summary>
    [Column("group_id")]
    public Guid GroupId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public Guid CreatorUserId { get; set; }

    public DateTimeOffset? DeactivatedAt { get; set; }

    public bool IsActive { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}