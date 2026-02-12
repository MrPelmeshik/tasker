using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Models.Entities;
using TaskStatus = TaskerApi.Models.Common.TaskStatus;

namespace TaskerApi.Models.Entities;

/// <summary>
///     Подзадачи
/// </summary>
[Table("subtasks")]
public class SubtaskEntity : 
    IDbEntity,
    IAutoIdBaseEntity<Guid>, 
    ISoftDeleteBaseEntity, 
    IUpdatedDateBaseEntity, 
    ICreatedDateBaseEntity,
    IOwnerUserBaseEntity
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

    /// <summary>
    /// Статус подзадачи
    /// </summary>
    [Column("status")]
    public TaskStatus Status { get; set; }

    /// <summary>
    /// Дата и время создания.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Идентификатор пользователя-владельца.
    /// </summary>
    public Guid OwnerUserId { get; set; }
    
    /// <summary>
    /// Уникальный идентификатор подзадачи.
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