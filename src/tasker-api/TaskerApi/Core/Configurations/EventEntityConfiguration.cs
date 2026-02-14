using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskerApi.Models.Entities;

namespace TaskerApi.Core.Configurations;

/// <summary>
/// Конфигурация EF Core для сущности Event.
/// </summary>
public class EventEntityConfiguration : IEntityTypeConfiguration<EventEntity>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<EventEntity> entity)
    {
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
        entity.Property(e => e.Message).HasColumnType("jsonb");
    }
}
