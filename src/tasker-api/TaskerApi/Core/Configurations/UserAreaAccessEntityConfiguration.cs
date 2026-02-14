using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Core.Configurations;

/// <summary>
/// Конфигурация EF Core для сущности UserAreaAccess.
/// </summary>
public class UserAreaAccessEntityConfiguration : IEntityTypeConfiguration<UserAreaAccessEntity>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<UserAreaAccessEntity> entity)
    {
        entity.ToTable("user_area_access");
        entity.HasKey(e => e.Id);
        entity.HasOne<UserEntity>()
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        entity.HasOne<AreaEntity>()
            .WithMany()
            .HasForeignKey(e => e.AreaId)
            .OnDelete(DeleteBehavior.Restrict);
        entity.HasOne<UserEntity>()
            .WithMany()
            .HasForeignKey(e => e.GrantedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
        entity.Property(e => e.Role)
            .HasConversion(
                r => r.ToString().ToLowerInvariant(),
                s => (AreaRole)Enum.Parse(typeof(AreaRole), s, true));
    }
}
