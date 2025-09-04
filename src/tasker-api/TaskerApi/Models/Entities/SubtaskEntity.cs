using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Entities;

namespace TaskerApi.Models.Entities;

/// <summary>
///     Подзадачи
/// </summary>
[Table("subtasks")]
public class SubtaskEntity : IIdBaseEntity<Guid>, ISoftDeleteBaseEntity, IUpdatedDateBaseEntity, ICreatedDateBaseEntity,
    ICreatorUserBaseEntity
{
    /// <summary>
    ///     Заголовок подзадачи
    /// </summary>
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    ///     Описание подзадачи
    /// </summary>
    [Column("description")]
    public string? Description { get; set; }

    /// <summary>
    ///     ID задачи
    /// </summary>
    [Column("task_id")]
    public Guid TaskId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public Guid CreatorUserId { get; set; }
    
    public Guid Id { get; set; }

    public DateTimeOffset? DeactivatedAt { get; set; }

    public bool IsActive { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}