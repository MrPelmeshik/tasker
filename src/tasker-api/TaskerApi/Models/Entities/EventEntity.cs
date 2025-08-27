using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskerApi.Models.Entities;

/// <summary>
/// События
/// </summary>
[Table("events")]
public class EventEntity
{
    /// <summary>
    /// ID события
    /// </summary>
    [Key, Column("id")]
    public Guid Id { get; set; }

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

    /// <summary>
    /// ID создателя
    /// </summary>
    [Column("creator_user_id")]
    public Guid CreatorUserId { get; set; }

    /// <summary>
    /// Дата создания
    /// </summary>
    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Дата обновления
    /// </summary>
    [Column("updated_at")]
    public DateTimeOffset UpdatedAt { get; set; }

    /// <summary>
    /// Дата деактивации
    /// </summary>
    [Column("deactivated_at")]
    public DateTimeOffset? DeactivatedAt { get; set; }

    /// <summary>
    /// Признак активности
    /// </summary>
    [Column("is_active")]
    public bool IsActive { get; set; }
}


