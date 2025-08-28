using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskerApi.Models.Entities.Interfaces;

public interface IGuidIdBaseEntity
{
    /// <summary>
    ///     ID области
    /// </summary>
    [Key]
    [Column("id")]
    Guid Id { get; set; }
}