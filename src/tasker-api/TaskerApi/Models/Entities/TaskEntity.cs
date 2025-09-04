using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Entities;

namespace TaskerApi.Models.Entities;

/// <summary>
/// Задачи
/// </summary>
[Table("tasks")]
public class TaskEntity : 
    IDbEntity,
    IIdBaseEntity<Guid>, 
    ISoftDeleteBaseEntity, 
    IUpdatedDateBaseEntity, 
    ICreatedDateBaseEntity,
    ICreatorUserBaseEntity
{
    /// <summary>
    /// Заголовок задачи
    /// </summary>
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Описание задачи
    /// </summary>
    [Column("description")]
    public string? Description { get; set; }

    /// <summary>
    /// ID группы
    /// </summary>
    [Column("group_id")]
    public Guid GroupId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public Guid CreatorUserId { get; set; }
    
    public Guid Id { get; set; }

    public DateTimeOffset? DeactivatedAt { get; set; }

    public bool IsActive { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}