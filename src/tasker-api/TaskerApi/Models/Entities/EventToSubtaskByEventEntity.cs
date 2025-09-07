using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Models.Entities.Base;
using TaskerApi.Models.Entities.Contracts;

namespace TaskerApi.Models.Entities;

[Table("events_2_subtask")]
public class EventToSubtaskByEventEntity : 
    EventRelationBaseEntity,
    IIdBaseEntity<Guid>
{
    [Key, Column("event_id")]
    public Guid Id { get; set; }

    [Column("subtask_id")]
    public Guid SubtaskId { get; set; }
}