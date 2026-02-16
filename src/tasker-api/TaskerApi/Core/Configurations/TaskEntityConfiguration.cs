using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskerApi.Models.Entities;

namespace TaskerApi.Core.Configurations;

/// <summary>
/// Конфигурация EF Core для сущности Task.
/// </summary>
public class TaskEntityConfiguration : IEntityTypeConfiguration<TaskEntity>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<TaskEntity> entity)
    {
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
        entity.Property(e => e.Description).HasMaxLength(10000);
        entity.HasOne(t => t.Area)
            .WithMany()
            .HasForeignKey(e => e.AreaId)
            .OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(t => t.Folder)
            .WithMany()
            .HasForeignKey(e => e.FolderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
