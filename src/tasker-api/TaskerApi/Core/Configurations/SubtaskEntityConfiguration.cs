using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskerApi.Models.Entities;

namespace TaskerApi.Core.Configurations;

/// <summary>
/// Конфигурация EF Core для сущности Subtask.
/// </summary>
public class SubtaskEntityConfiguration : IEntityTypeConfiguration<SubtaskEntity>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<SubtaskEntity> entity)
    {
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
        entity.Property(e => e.Description).HasMaxLength(2000);
        entity.HasOne<TaskEntity>()
            .WithMany()
            .HasForeignKey(e => e.TaskId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
