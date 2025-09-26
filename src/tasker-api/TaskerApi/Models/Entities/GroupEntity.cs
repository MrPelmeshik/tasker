using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Models.Entities;

namespace TaskerApi.Models.Entities;

/// <summary>
///     Группы
/// </summary>
[Table("groups")]
public class GroupEntity : 
    IDbEntity,
    IAutoIdBaseEntity<Guid>, 
    ISoftDeleteBaseEntity, 
    IUpdatedDateBaseEntity, 
    ICreatedDateBaseEntity, 
    ICreatorUserBaseEntity
{
    /// <summary>
    ///     Заголовок группы
    /// </summary>
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    ///     Описание группы
    /// </summary>
    [Column("description")]
    public string? Description { get; set; }

    /// <summary>
    ///     Идентификатор области
    /// </summary>
    [Column("area_id")]
    public Guid AreaId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public Guid CreatorUserId { get; set; }
    
    public Guid Id { get; set; }

    public DateTimeOffset? DeactivatedAt { get; set; }

    public bool IsActive { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}