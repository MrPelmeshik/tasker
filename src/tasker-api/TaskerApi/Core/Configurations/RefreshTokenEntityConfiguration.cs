using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskerApi.Models.Entities;

namespace TaskerApi.Core.Configurations;

/// <summary>
/// Конфигурация EF Core для сущности RefreshToken.
/// </summary>
public class RefreshTokenEntityConfiguration : IEntityTypeConfiguration<RefreshTokenEntity>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<RefreshTokenEntity> entity)
    {
        entity.HasKey(e => e.Id);
        entity.HasIndex(e => e.TokenHash).IsUnique();
        entity.HasOne<UserEntity>()
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
