using System.ComponentModel.DataAnnotations.Schema;

namespace TaskerApi.Interfaces.Models.Entities;

/// <summary>
/// Базовая сущность с ID создателя
/// </summary>
public interface ICreatorUserBaseEntity
{
    /// <summary>
    /// ID создателя
    /// </summary>
    [Column("creator_user_id")]
    Guid CreatorUserId { get; set; }
}

