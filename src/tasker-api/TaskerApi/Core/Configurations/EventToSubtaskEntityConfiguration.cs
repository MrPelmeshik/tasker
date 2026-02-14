using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskerApi.Models.Entities;

namespace TaskerApi.Core.Configurations;

/// <summary>
/// Конфигурация EF Core для связующей таблицы EventToSubtask.
/// </summary>
public class EventToSubtaskEntityConfiguration : IEntityTypeConfiguration<EventToSubtaskEntity>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<EventToSubtaskEntity> entity)
    {
        entity.ToTable("events_2_subtasks");
        entity.HasKey(e => new { e.EventId, e.SubtaskId });
        entity.HasOne<SubtaskEntity>()
            .WithMany()
            .HasForeignKey(e => e.SubtaskId)
            .OnDelete(DeleteBehavior.Restrict);
        entity.HasOne<EventEntity>()
            .WithMany()
            .HasForeignKey(e => e.EventId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
