using System.ComponentModel.DataAnnotations.Schema;

namespace TaskerApi.Models.Entities.Interfaces;

public interface ICreatorUserBaseEntity
{
    /// <summary>
    ///     ID создателя
    /// </summary>
    [Column("creator_user_id")]
    Guid CreatorUserId { get; set; }
}