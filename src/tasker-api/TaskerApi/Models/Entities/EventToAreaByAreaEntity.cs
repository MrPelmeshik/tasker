using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Models.Entities.Contracts;
using TaskerApi.Models.Entities.Base;

namespace TaskerApi.Models.Entities;

[Table("events_2_areas")]
public class EventToAreaByAreaEntity : 
    EventRelationBaseEntity, 
    IIdBaseEntity<Guid>
{
    /// <summary>
    /// ID события
    /// </summary>
    [Column("event_id")]
    public Guid EventId { get; set; }

    /// <summary>
    /// ID области
    /// </summary>
    [Key, Column("area_id")]
    public Guid Id { get; set; }
}