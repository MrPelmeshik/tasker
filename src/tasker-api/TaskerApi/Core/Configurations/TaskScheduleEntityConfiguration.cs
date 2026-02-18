using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskerApi.Models.Entities;

namespace TaskerApi.Core.Configurations;

/// <summary>
/// Конфигурация EF Core для сущности TaskSchedule.
/// </summary>
public class TaskScheduleEntityConfiguration : IEntityTypeConfiguration<TaskScheduleEntity>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<TaskScheduleEntity> entity)
    {
        entity.HasKey(e => e.Id);
        entity.Property(e => e.StartAt).IsRequired();
        entity.Property(e => e.EndAt).IsRequired();

        entity.HasOne(e => e.Task)
            .WithMany()
            .HasForeignKey(e => e.TaskId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasIndex(e => new { e.StartAt, e.EndAt })
            .HasFilter("is_active = true");
    }
}
