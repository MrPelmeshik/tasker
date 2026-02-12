using System.ComponentModel.DataAnnotations.Schema;

namespace TaskerApi.Interfaces.Models.Entities;

/// <summary>
/// Базовая сущность с ID владельца
/// </summary>
public interface IOwnerUserBaseEntity
{
    /// <summary>
    /// ID владельца
    /// </summary>
    [Column("owner_user_id")]
    Guid OwnerUserId { get; set; }
}
