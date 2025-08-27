using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskerApi.Models.Entities;

/// <summary>
/// Подзадачи
/// </summary>
[Table("subtasks")]
public class SubtaskEntity
{
    /// <summary>
    /// ID подзадачи
    /// </summary>
    [Key, Column("id")]
    public Guid Id { get; set; }

    /// <summary>
    /// Заголовок подзадачи
    /// </summary>
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Описание подзадачи
    /// </summary>
    [Column("description")]
    public string? Description { get; set; }

    /// <summary>
    /// ID задачи
    /// </summary>
    [Column("task_id")]
    public Guid TaskId { get; set; }

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


