using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Models.Entities;
using TaskerApi.Models.Entities.Base;

namespace TaskerApi.Models.Entities;

[Table("events_2_purposes")]
public class EventToPurposeByEventEntity : 
    EventRelationBaseEntity,
    IIdBaseEntity<Guid>
{
    [Key, Column("event_id")]
    public Guid Id { get; set; }

    [Column("purpose_id")]
    public Guid PurposeId { get; set; }
}