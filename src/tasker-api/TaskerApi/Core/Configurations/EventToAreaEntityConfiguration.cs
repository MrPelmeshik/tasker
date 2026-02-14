using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskerApi.Models.Entities;

namespace TaskerApi.Core.Configurations;

/// <summary>
/// Конфигурация EF Core для связующей таблицы EventToArea.
/// </summary>
public class EventToAreaEntityConfiguration : IEntityTypeConfiguration<EventToAreaEntity>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<EventToAreaEntity> entity)
    {
        entity.ToTable("events_2_areas");
        entity.HasKey(e => new { e.EventId, e.AreaId });
        entity.HasOne<AreaEntity>()
            .WithMany()
            .HasForeignKey(e => e.AreaId)
            .OnDelete(DeleteBehavior.Restrict);
        entity.HasOne<EventEntity>()
            .WithMany()
            .HasForeignKey(e => e.EventId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
