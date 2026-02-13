using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Models.Entities;

namespace TaskerApi.Models.Entities;

/// <summary>
/// Запись о refresh-токене для инвалидации при logout
/// </summary>
[Table("refresh_tokens")]
public class RefreshTokenEntity : IIdBaseEntity<Guid>
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("token_hash")]
    public string TokenHash { get; set; } = string.Empty;

    [Column("expires_at")]
    public DateTimeOffset ExpiresAt { get; set; }

    [Column("revoked")]
    public bool Revoked { get; set; }

    [Column("created_at")]
    public DateTimeOffset CreatedAt { get; set; }
}
