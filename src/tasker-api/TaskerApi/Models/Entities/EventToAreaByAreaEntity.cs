using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Entities;
using TaskerApi.Models.Entities.Base;

namespace TaskerApi.Models.Entities;

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