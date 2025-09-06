using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Entities;

namespace TaskerApi.Models.Entities;

/// <summary>
/// Пользователи
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
    /// Имя пользователя
    /// </summary>
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Email пользователя
    /// </summary>
    [Column("email")]
    public string? Email { get; set; }

    /// <summary>
    /// Имя (first name)
    /// </summary>
    [Column("first_name")]
    public string? FirstName { get; set; }

    /// <summary>
    /// Фамилия (last name)
    /// </summary>
    [Column("last_name")]
    public string? LastName { get; set; }

    /// <summary>
    /// Хеш пароля (PBKDF2/Base64)
    /// </summary>
    [Column("password_hash")]
    public string? PasswordHash { get; set; }

    /// <summary>
    /// Соль пароля (Base64)
    /// </summary>
    [Column("password_salt")]
    public string? PasswordSalt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    
    public Guid Id { get; set; }

    public DateTimeOffset? DeactivatedAt { get; set; }

    public bool IsActive { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}