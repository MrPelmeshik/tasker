using System.ComponentModel.DataAnnotations.Schema;

namespace TaskerApi.Interfaces.Entities;

public interface IUpdatedDateBaseEntity
{
    /// <summary>
    ///     Дата обновления
    /// </summary>
    [Column("updated_at")]
    DateTimeOffset UpdatedAt { get; set; }
}