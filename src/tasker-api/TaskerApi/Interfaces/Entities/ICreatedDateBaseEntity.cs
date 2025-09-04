using System.ComponentModel.DataAnnotations.Schema;

namespace TaskerApi.Interfaces.Entities;

public interface ICreatedDateBaseEntity
{
    /// <summary>
    /// Дата создания
    /// </summary>
    [Column("created_at")]
    DateTimeOffset CreatedAt { get; set; }
}