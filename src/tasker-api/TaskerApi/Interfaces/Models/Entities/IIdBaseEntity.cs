using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskerApi.Interfaces.Models.Entities;

/// <summary>
/// Базовая сущность с ID
/// </summary>
public interface IIdBaseEntity<T>
{
    /// <summary>
    /// ID
    /// </summary>
    [Key, Column("id")]
    T Id { get; set; }
}

