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

    /// <summary>
    /// Дата и время создания.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Идентификатор пользователя-создателя.
    /// </summary>
    public Guid CreatorUserId { get; set; }
    
    /// <summary>
    /// Уникальный идентификатор группы.
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