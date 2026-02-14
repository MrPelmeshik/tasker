using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskerApi.Models.Entities;

namespace TaskerApi.Core.Configurations;

/// <summary>
/// Конфигурация EF Core для сущности UserLog.
/// </summary>
public class UserLogEntityConfiguration : IEntityTypeConfiguration<UserLogEntity>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<UserLogEntity> entity)
    {
        entity.ToTable("user_logs");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).ValueGeneratedOnAdd();
        entity.Property(e => e.HttpMethod).IsRequired().HasMaxLength(10);
        entity.Property(e => e.Endpoint).IsRequired().HasMaxLength(255);
        entity.Property(e => e.IpAddress).HasMaxLength(45);
        entity.Property(e => e.UserAgent).HasMaxLength(500);
        entity.Property(e => e.ErrorMessage).HasMaxLength(1000);
        entity.Ignore(e => e.RequestParams);
        entity.HasOne<UserEntity>()
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
