using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Models.Entities.Contracts;

namespace TaskerApi.Models.Entities;

/// <summary>
/// События
/// </summary>
[Table("events")]
public class EventEntity : 
    IDbEntity,
    IIdBaseEntity<Guid>, 
    ISoftDeleteBaseEntity, 
    IUpdatedDateBaseEntity, 
    ICreatedDateBaseEntity, 
    ICreatorUserBaseEntity
{
    /// <summary>
    /// Заголовок события
    /// </summary>
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Описание события
    /// </summary>
    [Column("description")]
    public string? Description { get; set; }
    
    public DateTimeOffset CreatedAt { get; set; }

    public Guid CreatorUserId { get; set; }
    public Guid Id { get; set; }
    
    public DateTimeOffset? DeactivatedAt { get; set; }
    
    public bool IsActive { get; set; }
    
    public DateTimeOffset UpdatedAt { get; set; }
}