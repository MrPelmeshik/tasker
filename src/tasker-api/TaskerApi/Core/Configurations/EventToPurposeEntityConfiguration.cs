using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskerApi.Models.Entities;

namespace TaskerApi.Core.Configurations;

/// <summary>
/// Конфигурация EF Core для связующей таблицы EventToPurpose.
/// </summary>
public class EventToPurposeEntityConfiguration : IEntityTypeConfiguration<EventToPurposeEntity>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<EventToPurposeEntity> entity)
    {
        entity.ToTable("events_2_purposes");
        entity.HasKey(e => new { e.EventId, e.PurposeId });
        entity.HasOne<PurposeEntity>()
            .WithMany()
            .HasForeignKey(e => e.PurposeId)
            .OnDelete(DeleteBehavior.Restrict);
        entity.HasOne<EventEntity>()
            .WithMany()
            .HasForeignKey(e => e.EventId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
