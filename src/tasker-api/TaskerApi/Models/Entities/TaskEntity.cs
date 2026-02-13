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
    IOwnerUserBaseEntity
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
    /// ID области
    /// </summary>
    [Column("area_id")]
    public Guid AreaId { get; set; }

    /// <summary>
    /// ID папки (null = в корне области)
    /// </summary>
    [Column("folder_id")]
    public Guid? FolderId { get; set; }

    /// <summary>
    /// Навигационное свойство к области (для каскадных query filters)
    /// </summary>
    public AreaEntity? Area { get; set; }

    /// <summary>
    /// Навигационное свойство к папке (для каскадных query filters)
    /// </summary>
    public FolderEntity? Folder { get; set; }

    /// <summary>
    /// Статус задачи
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
    /// Уникальный идентификатор задачи.
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