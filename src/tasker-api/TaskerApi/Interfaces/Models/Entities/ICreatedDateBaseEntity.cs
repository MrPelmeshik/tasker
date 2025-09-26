using System.ComponentModel.DataAnnotations.Schema;

namespace TaskerApi.Interfaces.Models.Entities;

/// <summary>
/// Базовая сущность с датой создания
/// </summary>
public interface ICreatedDateBaseEntity
{
    /// <summary>
    /// Дата создания
    /// </summary>
    [Column("created_at")]
    DateTimeOffset CreatedAt { get; set; }
}

