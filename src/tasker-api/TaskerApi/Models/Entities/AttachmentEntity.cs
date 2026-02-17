using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Models.Entities;
using TaskerApi.Models.Common;

namespace TaskerApi.Models.Entities;

/// <summary>
/// Вложения (файлы), прикрепленные к сущностям (Task, Event, Area, Folder).
/// </summary>
[Table("attachments")]
public class AttachmentEntity : 
    IDbEntity,
    IAutoIdBaseEntity<Guid>, 
    ISoftDeleteBaseEntity, 
    IUpdatedDateBaseEntity, 
    ICreatedDateBaseEntity,
    IOwnerUserBaseEntity
{
    /// <summary>
    /// Оригинальное имя файла (как его загрузил пользователь).
    /// </summary>
    [Column("original_file_name")]
    public string OriginalFileName { get; set; } = string.Empty;

    /// <summary>
    /// Имя файла в хранилище (уникальное).
    /// </summary>
    [Column("storage_file_name")]
    public string StorageFileName { get; set; } = string.Empty;

    /// <summary>
    /// MIME-тип содержимого (например, image/png).
    /// </summary>
    [Column("content_type")]
    public string ContentType { get; set; } = string.Empty;

    /// <summary>
    /// Размер файла в байтах.
    /// </summary>
    [Column("size")]
    public long Size { get; set; }

    /// <summary>
    /// Идентификатор сущности, к которой прикреплен файл.
    /// </summary>
    [Column("entity_id")]
    public Guid EntityId { get; set; }

    /// <summary>
    /// Тип сущности, к которой прикреплен файл.
    /// </summary>
    [Column("entity_type")]
    public EntityType EntityType { get; set; }

    /// <summary>
    /// Дата и время создания.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Идентификатор пользователя-владельца (кто загрузил).
    /// </summary>
    public Guid OwnerUserId { get; set; }
    
    /// <summary>
    /// Уникальный идентификатор вложения.
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
