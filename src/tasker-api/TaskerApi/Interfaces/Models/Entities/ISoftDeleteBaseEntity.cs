using System.ComponentModel.DataAnnotations.Schema;

namespace TaskerApi.Interfaces.Models.Entities;

/// <summary>
/// Базовая сущность с датой деактивации
/// </summary>
public interface ISoftDeleteBaseEntity
{
    /// <summary>
    /// Дата деактивации
    /// </summary>
    [Column("deactivated_at")]
    DateTimeOffset? DeactivatedAt { get; set; }

    /// <summary>
    /// Признак активности
    /// </summary>
    [Column("is_active")]
    bool IsActive { get; set; }
}

