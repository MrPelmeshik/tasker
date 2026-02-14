using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskerApi.Models.Entities;

namespace TaskerApi.Core.Configurations;

/// <summary>
/// Конфигурация EF Core для связующей таблицы EventToTask.
/// </summary>
public class EventToTaskEntityConfiguration : IEntityTypeConfiguration<EventToTaskEntity>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<EventToTaskEntity> entity)
    {
        entity.ToTable("events_2_tasks");
        entity.HasKey(e => new { e.EventId, e.TaskId });
        entity.HasOne<TaskEntity>()
            .WithMany()
            .HasForeignKey(e => e.TaskId)
            .OnDelete(DeleteBehavior.Restrict);
        entity.HasOne<EventEntity>()
            .WithMany()
            .HasForeignKey(e => e.EventId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
