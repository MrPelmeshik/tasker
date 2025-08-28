using System.ComponentModel.DataAnnotations.Schema;

namespace TaskerApi.Models.Entities.Interfaces;

public interface IUpdatedDateBaseEntity
{
    /// <summary>
    ///     Дата обновления
    /// </summary>
    [Column("updated_at")]
    DateTimeOffset UpdatedAt { get; set; }
}