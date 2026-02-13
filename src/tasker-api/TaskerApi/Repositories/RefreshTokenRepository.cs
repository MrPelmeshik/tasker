using Microsoft.EntityFrameworkCore;
using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Models.Entities;

namespace TaskerApi.Repositories;

/// <summary>
/// Реализация репозитория refresh-токенов
/// </summary>
public class RefreshTokenRepository(TaskerDbContext context, ILogger<RefreshTokenRepository> logger)
    : IRefreshTokenRepository
{
    /// <inheritdoc />
    public async Task StoreAsync(Guid userId, string tokenHash, DateTimeOffset expiresAt, CancellationToken cancellationToken = default)
    {
        var entity = new RefreshTokenEntity
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = tokenHash,
            ExpiresAt = expiresAt,
            Revoked = false,
            CreatedAt = DateTimeOffset.UtcNow
        };
        context.RefreshTokens.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> IsValidAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        return await context.RefreshTokens
            .AnyAsync(rt => rt.TokenHash == tokenHash && !rt.Revoked && rt.ExpiresAt > now, cancellationToken);
    }

    /// <inheritdoc />
    public async Task RevokeByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        var tokens = await context.RefreshTokens
            .Where(rt => rt.TokenHash == tokenHash)
            .ToListAsync(cancellationToken);
        foreach (var t in tokens)
            t.Revoked = true;
        if (tokens.Count > 0)
            await context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<int> DeleteExpiredAndRevokedAsync(TimeSpan revokedMaxAge, CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        var revokedThreshold = now - revokedMaxAge;
        var toDelete = await context.RefreshTokens
            .Where(rt => rt.ExpiresAt < now || (rt.Revoked && rt.CreatedAt < revokedThreshold))
            .ToListAsync(cancellationToken);
        context.RefreshTokens.RemoveRange(toDelete);
        if (toDelete.Count > 0)
            await context.SaveChangesAsync(cancellationToken);
        return toDelete.Count;
    }
}
