using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskerApi.Interfaces.Models.Entities;

/// <summary>
/// Базовая сущность с ID
/// </summary>
public interface IAutoIdBaseEntity<T> : IIdBaseEntity<T>
{
    /// <summary>
    /// ID
    /// </summary>
    [Key, Editable(false), DatabaseGenerated(DatabaseGeneratedOption.Identity), Column("id")]
    new T Id { get; set; }
}

