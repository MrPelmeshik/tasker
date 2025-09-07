using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskerApi.Models.Entities.Contracts;

/// <summary>
/// Базовая сущность с ID
/// </summary>
public interface IIdBaseEntity<T>
{
    /// <summary>
    /// ID
    /// </summary>
    [Key, Editable(false), DatabaseGenerated(DatabaseGeneratedOption.Identity), Column("id")]
    T Id { get; set; }
}

