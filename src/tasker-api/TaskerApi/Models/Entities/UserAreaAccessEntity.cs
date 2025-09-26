using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Models.Entities;

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

    public DateTimeOffset CreatedAt { get; set; }
    
    public Guid Id { get; set; }

    public DateTimeOffset? DeactivatedAt { get; set; }

    public bool IsActive { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
