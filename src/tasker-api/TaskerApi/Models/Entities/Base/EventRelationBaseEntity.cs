using TaskerApi.Interfaces.Models.Entities;

namespace TaskerApi.Models.Entities.Base;

/// <summary>
/// Базовая модель связи события
/// </summary>
public abstract class EventRelationBaseEntity : 
    IDbEntity,
    IOwnerUserBaseEntity, 
    ICreatedDateBaseEntity, 
    IUpdatedDateBaseEntity, 
    ISoftDeleteBaseEntity
{
    /// <summary>
    /// Дата и время создания.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Идентификатор пользователя-владельца.
    /// </summary>
    public Guid OwnerUserId { get; set; }

    /// <summary>
    /// Дата и время деактивации (мягкое удаление).
    /// </summary>
    public DateTimeOffset? DeactivatedAt { get; set; }

    /// <summary>
    /// Флаг активности записи.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Дата и время последнего обновления.
    /// </summary>
    public DateTimeOffset UpdatedAt { get; set; }
}