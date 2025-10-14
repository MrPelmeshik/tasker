using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Models.Entities;

namespace TaskerApi.Models.Entities;

/// <summary>
/// Связь событий с группами
/// </summary>
[Table("events_2_groups")]
public class EventToGroupEntity : 
    IDbEntity,
    ISoftDeleteBaseEntity, 
    IUpdatedDateBaseEntity, 
    ICreatedDateBaseEntity,
    ICreatorUserBaseEntity
{
    /// <summary>
    /// ID события
    /// </summary>
    [Column("event_id")]
    public Guid EventId { get; set; }

    /// <summary>
    /// ID группы
    /// </summary>
    [Column("group_id")]
    public Guid GroupId { get; set; }

    /// <summary>
    /// Дата и время создания.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Идентификатор пользователя-создателя.
    /// </summary>
    public Guid CreatorUserId { get; set; }
    
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
