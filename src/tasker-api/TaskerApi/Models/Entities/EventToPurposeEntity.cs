using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskerApi.Models.Entities;

/// <summary>
/// Связь события и цели
/// </summary>
[Table("events_2_purpose")]
public class EventToPurposeEntity
{
    /// <summary>
    /// ID события
    /// </summary>
    [Column("event_id")]
    public Guid EventId { get; set; }

    /// <summary>
    /// ID цели
    /// </summary>
    [Column("purpose_id")]
    public Guid PurposeId { get; set; }

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


