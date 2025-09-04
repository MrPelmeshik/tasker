using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Entities;
using TaskerApi.Models.Entities.Base;

namespace TaskerApi.Models.Entities;

public class EventToGroupByEventEntity : EventRelationBaseEntity, IIdBaseEntity<Guid>
{
    /// <summary>
    /// ID события
    /// </summary>
    [Key, Column("event_id")]
    public Guid Id { get; set; }

    /// <summary>
    /// ID области
    /// </summary>
    [Column("group_id")]
    public Guid GroupId { get; set; }
}