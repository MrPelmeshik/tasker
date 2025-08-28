using System.ComponentModel.DataAnnotations.Schema;

namespace TaskerApi.Models.Entities.Interfaces;

public interface ICreatedDateBaseEntity
{
    /// <summary>
    ///     Дата создания
    /// </summary>
    [Column("created_at")]
    DateTimeOffset CreatedAt { get; set; }
}