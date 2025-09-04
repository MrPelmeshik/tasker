using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskerApi.Interfaces.Entities;

public interface IIdBaseEntity<T>
{
    /// <summary>
    /// ID
    /// </summary>
    [Key, Editable(false), DatabaseGenerated(DatabaseGeneratedOption.Identity), Column("id")]
    T Id { get; set; }
}