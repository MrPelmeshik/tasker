using TaskerApi.Interfaces.Entities;

namespace TaskerApi.Models.Entities.Base;

public class EventRelationBaseEntity : 
    ICreatorUserBaseEntity, 
    ICreatedDateBaseEntity, 
    IUpdatedDateBaseEntity, 
    ISoftDeleteBaseEntity
{
    public DateTimeOffset CreatedAt { get; set; }

    public Guid CreatorUserId { get; set; }

    public DateTimeOffset? DeactivatedAt { get; set; }

    public bool IsActive { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}