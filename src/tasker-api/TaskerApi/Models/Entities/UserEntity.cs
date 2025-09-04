using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Entities;

namespace TaskerApi.Models.Entities;

/// <summary>
///     Пользователи
/// </summary>
[Table("users")]
public class UserEntity : 
    IDbEntity,
    IIdBaseEntity<Guid>, 
    ISoftDeleteBaseEntity, 
    IUpdatedDateBaseEntity, 
    ICreatedDateBaseEntity
{
    /// <summary>
    ///     Имя пользователя
    /// </summary>
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }
    
    public Guid Id { get; set; }

    public DateTimeOffset? DeactivatedAt { get; set; }

    public bool IsActive { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}