using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskerApi.Models.Entities;

namespace TaskerApi.Core.Configurations;

/// <summary>
/// Конфигурация EF Core для сущности User.
/// </summary>
public class UserEntityConfiguration : IEntityTypeConfiguration<UserEntity>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<UserEntity> entity)
    {
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
        entity.Property(e => e.Email).HasMaxLength(255);
        entity.Property(e => e.FirstName).HasMaxLength(255);
        entity.Property(e => e.LastName).HasMaxLength(255);
        entity.Property(e => e.PasswordHash).HasMaxLength(255);
        entity.Property(e => e.PasswordSalt).HasMaxLength(255);
        entity.Ignore(e => e.IsAdmin);
        entity.HasIndex(e => e.Name).IsUnique();
        entity.HasIndex(e => e.Email).IsUnique();
    }
}
