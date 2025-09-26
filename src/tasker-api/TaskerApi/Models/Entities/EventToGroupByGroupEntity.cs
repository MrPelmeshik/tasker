using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Models.Entities.Base;
using TaskerApi.Models.Entities.Contracts;

namespace TaskerApi.Models.Entities;

[Table("events_2_groups")]
public class EventToGroupByGroupEntity : 
    EventRelationBaseEntity,
    IIdBaseEntity<Guid>
{
    [Column("event_id")]
    public Guid EventId { get; set; }

    [Key, Column("group_id")]
    public Guid Id { get; set; }
}