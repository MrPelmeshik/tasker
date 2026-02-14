using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskerApi.Models.Entities;

namespace TaskerApi.Core.Configurations;

/// <summary>
/// Конфигурация EF Core для сущности Purpose.
/// </summary>
public class PurposeEntityConfiguration : IEntityTypeConfiguration<PurposeEntity>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<PurposeEntity> entity)
    {
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
        entity.Property(e => e.Description).HasMaxLength(1000);
    }
}
