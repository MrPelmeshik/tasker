using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Models.Entities.Base;
using TaskerApi.Models.Entities.Contracts;

namespace TaskerApi.Models.Entities;

[Table("events_2_purpose")]
public class EventToPurposeByEventEntity : 
    EventRelationBaseEntity,
    IIdBaseEntity<Guid>
{
    [Key, Column("event_id")]
    public Guid Id { get; set; }

    [Column("purpose_id")]
    public Guid PurposeId { get; set; }
}