using TaskerApi.Models.Entities.Contracts;

namespace TaskerApi.Models.Entities.Base;

/// <summary>
/// Базовая модель связи события
/// </summary>
public abstract class EventRelationBaseEntity : 
    IDbEntity,
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