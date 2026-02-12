using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Models.Entities;
using TaskerApi.Models.Common;

namespace TaskerApi.Models.Entities;

/// <summary>
/// Права доступа пользователей к областям
/// </summary>
[Table("user_area_access")]
public class UserAreaAccessEntity : 
    IDbEntity,
    IAutoIdBaseEntity<Guid>, 
    ISoftDeleteBaseEntity, 
    IUpdatedDateBaseEntity, 
    ICreatedDateBaseEntity
{
    /// <summary>
    /// ID пользователя
    /// </summary>
    [Column("user_id")]
    public Guid UserId { get; set; }

    /// <summary>
    /// ID области
    /// </summary>
    [Column("area_id")]
    public Guid AreaId { get; set; }

    /// <summary>
    /// ID пользователя, предоставившего доступ
    /// </summary>
    [Column("granted_by_user_id")]
    public Guid GrantedByUserId { get; set; }

    /// <summary>
    /// Роль пользователя в области
    /// </summary>
    [Column("role")]
    public AreaRole Role { get; set; }

    /// <summary>
    /// Дата и время создания.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }
    
    /// <summary>
    /// Уникальный идентификатор записи доступа.
    /// </summary>
    public Guid Id { get; set; }

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
