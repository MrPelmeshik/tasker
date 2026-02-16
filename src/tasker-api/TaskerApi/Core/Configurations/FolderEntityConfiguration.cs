using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskerApi.Models.Entities;

namespace TaskerApi.Core.Configurations;

/// <summary>
/// Конфигурация EF Core для сущности Folder.
/// </summary>
public class FolderEntityConfiguration : IEntityTypeConfiguration<FolderEntity>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<FolderEntity> entity)
    {
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
        entity.Property(e => e.Description).HasMaxLength(10000);
        entity.HasOne(f => f.Area)
            .WithMany()
            .HasForeignKey(e => e.AreaId)
            .OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(f => f.ParentFolder)
            .WithMany()
            .HasForeignKey(e => e.ParentFolderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
