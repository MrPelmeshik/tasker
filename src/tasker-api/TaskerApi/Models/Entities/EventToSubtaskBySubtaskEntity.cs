using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Models.Entities;
using TaskerApi.Models.Entities.Base;

namespace TaskerApi.Models.Entities;

[Table("events_2_subtasks")]
public class EventToSubtaskBySubtaskEntity : 
    EventRelationBaseEntity,
    IIdBaseEntity<Guid>
{
    [Column("event_id")]
    public Guid EventId { get; set; }

    [Key, Column("subtask_id")]
    public Guid Id { get; set; }
}


