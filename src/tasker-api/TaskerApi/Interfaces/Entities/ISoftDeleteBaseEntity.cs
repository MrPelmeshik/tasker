using System.ComponentModel.DataAnnotations.Schema;

namespace TaskerApi.Interfaces.Entities;

public interface ISoftDeleteBaseEntity
{
    /// <summary>
    ///     Дата деактивации
    /// </summary>
    [Column("deactivated_at")]
    DateTimeOffset? DeactivatedAt { get; set; }

    /// <summary>
    ///     Признак активности
    /// </summary>
    [Column("is_active")]
    bool IsActive { get; set; }
}