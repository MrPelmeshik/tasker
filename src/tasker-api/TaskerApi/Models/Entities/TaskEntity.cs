using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Models.Entities;
using TaskerApi.Models.Common;
using TaskStatus = TaskerApi.Models.Common.TaskStatus;

namespace TaskerApi.Models.Entities;

/// <summary>
/// Задачи
/// </summary>
[Table("tasks")]
public class TaskEntity : 
    IDbEntity,
    IAutoIdBaseEntity<Guid>, 
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

    /// <summary>
    /// Статус задачи
    /// </summary>
    [Column("status")]
    public TaskStatus Status { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public Guid CreatorUserId { get; set; }
    
    public Guid Id { get; set; }

    public DateTimeOffset? DeactivatedAt { get; set; }

    public bool IsActive { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}