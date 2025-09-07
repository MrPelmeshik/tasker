using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Models.Entities.Contracts;
using TaskerApi.Models.Entities.Base;

namespace TaskerApi.Models.Entities;

[Table("event_2_area")]
public class EventToAreaByEventEntity : 
    EventRelationBaseEntity, 
    IIdBaseEntity<Guid>
{
    /// <summary>
    /// ID события
    /// </summary>
    [Key, Column("event_id")]
    public Guid Id { get; set; }

    /// <summary>
    /// ID области
    /// </summary>
    [Column("area_id")]
    public Guid AreaId { get; set; }
}