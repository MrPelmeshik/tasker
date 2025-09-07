using System.ComponentModel.DataAnnotations.Schema;

namespace TaskerApi.Models.Entities.Contracts;

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

