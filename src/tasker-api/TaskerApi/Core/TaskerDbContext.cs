using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using TaskerApi.Interfaces.Models.Entities;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Core;

/// <summary>
/// Контекст базы данных Entity Framework для системы Tasker.
/// </summary>
public class TaskerDbContext : DbContext
{
    public TaskerDbContext(DbContextOptions<TaskerDbContext> options) : base(options)
    {
    }

    public DbSet<UserEntity> Users { get; set; }
    public DbSet<AreaEntity> Areas { get; set; }
    public DbSet<FolderEntity> Folders { get; set; }
    public DbSet<TaskEntity> Tasks { get; set; }
    public DbSet<SubtaskEntity> Subtasks { get; set; }
    public DbSet<PurposeEntity> Purposes { get; set; }
    public DbSet<EventEntity> Events { get; set; }
    public DbSet<UserLogEntity> UserLogs { get; set; }
    public DbSet<UserAreaAccessEntity> UserAreaAccesses { get; set; }
    public DbSet<EventToAreaEntity> EventToAreas { get; set; }
    public DbSet<EventToTaskEntity> EventToTasks { get; set; }
    public DbSet<EventToPurposeEntity> EventToPurposes { get; set; }
    public DbSet<EventToSubtaskEntity> EventToSubtasks { get; set; }
    public DbSet<RefreshTokenEntity> RefreshTokens { get; set; }

    /// <inheritdoc />
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(GetType().Assembly);
        ConfigureSnakeCaseColumnNames(modelBuilder);
        ConfigureSoftDeleteFilters(modelBuilder);
        ConfigureCascadingActiveFilters(modelBuilder);
    }

    /// <summary>
    /// Глобальный Query Filter для сущностей с soft delete (IsActive = true).
    /// </summary>
    private static void ConfigureSoftDeleteFilters(ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (!typeof(ISoftDeleteBaseEntity).IsAssignableFrom(entityType.ClrType))
                continue;
            var isActiveProperty = entityType.ClrType.GetProperty("IsActive");
            if (isActiveProperty == null)
                continue;
            var parameter = Expression.Parameter(entityType.ClrType, "e");
            var propertyAccess = Expression.Property(parameter, isActiveProperty);
            var body = Expression.Equal(propertyAccess, Expression.Constant(true));
            var lambda = Expression.Lambda(body, parameter);
            modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
        }
    }

    /// <summary>
    /// Каскадные Query Filter для Task и Folder по иерархии Area → Folder → Task.
    /// </summary>
    private void ConfigureCascadingActiveFilters(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TaskEntity>().HasQueryFilter(t =>
            t.IsActive && t.Area != null && t.Area.IsActive && (t.FolderId == null || (t.Folder != null && t.Folder.IsActive)));
        modelBuilder.Entity<FolderEntity>().HasQueryFilter(f =>
            f.IsActive && f.Area != null && f.Area.IsActive);
    }

    /// <summary>
    /// Имена колонок в формате snake_case для всех сущностей.
    /// </summary>
    private static void ConfigureSnakeCaseColumnNames(ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var entityBuilder = modelBuilder.Entity(entityType.ClrType);
            var idProperty = entityType.FindProperty("Id");
            if (idProperty != null && idProperty.PropertyInfo != null)
                entityBuilder.Property("Id").HasColumnName("id");
            var createdAtProperty = entityType.FindProperty("CreatedAt");
            if (createdAtProperty != null && createdAtProperty.PropertyInfo != null)
                entityBuilder.Property("CreatedAt").HasColumnName("created_at");
            var updatedAtProperty = entityType.FindProperty("UpdatedAt");
            if (updatedAtProperty != null && updatedAtProperty.PropertyInfo != null)
                entityBuilder.Property("UpdatedAt").HasColumnName("updated_at");
            var deactivatedAtProperty = entityType.FindProperty("DeactivatedAt");
            if (deactivatedAtProperty != null && deactivatedAtProperty.PropertyInfo != null)
                entityBuilder.Property("DeactivatedAt").HasColumnName("deactivated_at");
            var isActiveProperty = entityType.FindProperty("IsActive");
            if (isActiveProperty != null && isActiveProperty.PropertyInfo != null)
                entityBuilder.Property("IsActive").HasColumnName("is_active");
            var ownerUserIdProperty = entityType.FindProperty("OwnerUserId");
            if (ownerUserIdProperty != null && ownerUserIdProperty.PropertyInfo != null)
                entityBuilder.Property("OwnerUserId").HasColumnName("owner_user_id");
        }
    }
}
