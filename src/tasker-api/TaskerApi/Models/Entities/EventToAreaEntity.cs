using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Models.Entities.Interfaces;

namespace TaskerApi.Models.Entities;

/// <summary>
///     Связь события и области
/// </summary>
[Table("events_2_area")]
public class EventToAreaEntity : ICreatorUserBaseEntity, ICreatedDateBaseEntity, IUpdatedDateBaseEntity,
    ISoftDeleteBaseEntity
{
    /// <summary>
    ///     ID события
    /// </summary>
    [Column("event_id")]
    public Guid EventId { get; set; }

    /// <summary>
    ///     ID области
    /// </summary>
    [Column("area_id")]
    public Guid AreaId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public Guid CreatorUserId { get; set; }

    public DateTimeOffset? DeactivatedAt { get; set; }

    public bool IsActive { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}