using Microsoft.EntityFrameworkCore;
using TaskerApi.Models.Entities;

namespace TaskerApi.Core;

/// <summary>
/// Контекст базы данных для Entity Framework, содержащий все сущности системы Tasker
/// </summary>
public class TaskerDbContext : DbContext
{
    /// <summary>
    /// Инициализирует новый экземпляр контекста базы данных
    /// </summary>
    /// <param name="options">Параметры конфигурации для контекста базы данных</param>
    public TaskerDbContext(DbContextOptions<TaskerDbContext> options) : base(options)
    {
    }

    /// <summary>
    /// Коллекция пользователей системы
    /// </summary>
    public DbSet<UserEntity> Users { get; set; }
    
    /// <summary>
    /// Коллекция областей (рабочих пространств)
    /// </summary>
    public DbSet<AreaEntity> Areas { get; set; }
    
    /// <summary>
    /// Коллекция групп задач
    /// </summary>
    public DbSet<GroupEntity> Groups { get; set; }
    
    /// <summary>
    /// Коллекция задач
    /// </summary>
    public DbSet<TaskEntity> Tasks { get; set; }
    
    /// <summary>
    /// Коллекция подзадач
    /// </summary>
    public DbSet<SubtaskEntity> Subtasks { get; set; }
    
    /// <summary>
    /// Коллекция целей
    /// </summary>
    public DbSet<PurposeEntity> Purposes { get; set; }
    
    /// <summary>
    /// Коллекция событий
    /// </summary>
    public DbSet<EventEntity> Events { get; set; }
    
    /// <summary>
    /// Коллекция логов пользователей
    /// </summary>
    public DbSet<UserLogEntity> UserLogs { get; set; }
    
    /// <summary>
    /// Коллекция доступа пользователей к областям
    /// </summary>
    public DbSet<UserAreaAccessEntity> UserAreaAccesses { get; set; }

    /// <summary>
    /// Связующая таблица между событиями и областями
    /// </summary>
    public DbSet<EventToAreaEntity> EventToAreas { get; set; }
    
    /// <summary>
    /// Связующая таблица между событиями и группами
    /// </summary>
    public DbSet<EventToGroupEntity> EventToGroups { get; set; }
    
    /// <summary>
    /// Связующая таблица между событиями и задачами
    /// </summary>
    public DbSet<EventToTaskEntity> EventToTasks { get; set; }
    
    /// <summary>
    /// Связующая таблица между событиями и целями
    /// </summary>
    public DbSet<EventToPurposeEntity> EventToPurposes { get; set; }
    
    /// <summary>
    /// Связующая таблица между событиями и подзадачами
    /// </summary>
    public DbSet<EventToSubtaskEntity> EventToSubtasks { get; set; }

    /// <summary>
    /// Настраивает модель базы данных, определяя связи между сущностями, ограничения и индексы
    /// </summary>
    /// <param name="modelBuilder">Построитель модели Entity Framework</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Configure snake_case column names for all entities
        ConfigureSnakeCaseColumnNames(modelBuilder);

        modelBuilder.Entity<UserEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FirstName).HasMaxLength(255);
            entity.Property(e => e.LastName).HasMaxLength(255);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.PasswordSalt).HasMaxLength(255);
            
            // Ignore IsAdmin property - the column doesn't exist in the database
            entity.Ignore(e => e.IsAdmin);
            
            entity.HasIndex(e => e.Name).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        modelBuilder.Entity<AreaEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).HasMaxLength(1000);
        });

        modelBuilder.Entity<GroupEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).HasMaxLength(1000);
            
            entity.HasOne<AreaEntity>()
                .WithMany()
                .HasForeignKey(e => e.AreaId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TaskEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).HasMaxLength(2000);
            
            entity.HasOne<GroupEntity>()
                .WithMany()
                .HasForeignKey(e => e.GroupId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<SubtaskEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).HasMaxLength(2000);
            
            entity.HasOne<TaskEntity>()
                .WithMany()
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PurposeEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).HasMaxLength(1000);
        });

        modelBuilder.Entity<EventEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).HasMaxLength(2000);
        });

        modelBuilder.Entity<UserLogEntity>(entity =>
        {
            entity.ToTable("user_logs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.HttpMethod).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Endpoint).IsRequired().HasMaxLength(255);
            entity.Property(e => e.IpAddress).HasMaxLength(45);
            entity.Property(e => e.UserAgent).HasMaxLength(500);
            entity.Property(e => e.ErrorMessage).HasMaxLength(1000);
            
            // Ignore RequestParams property - it's of type object which EF Core can't map directly
            // The column exists in DB as jsonb, but we'll handle it manually if needed
            entity.Ignore(e => e.RequestParams);
            
            entity.HasOne<UserEntity>()
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<UserAreaAccessEntity>(entity =>
        {
            entity.ToTable("user_area_access");
            entity.HasKey(e => e.Id);
            
            entity.HasOne<UserEntity>()
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne<AreaEntity>()
                .WithMany()
                .HasForeignKey(e => e.AreaId)
                .OnDelete(DeleteBehavior.Restrict);
                
            // Foreign key relationship for GrantedByUserId (no navigation property)
            entity.HasOne<UserEntity>()
                .WithMany()
                .HasForeignKey(e => e.GrantedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<EventToAreaEntity>(entity =>
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
        });

        modelBuilder.Entity<EventToGroupEntity>(entity =>
        {
            entity.ToTable("events_2_groups");
            entity.HasKey(e => new { e.EventId, e.GroupId });
            
            entity.HasOne<GroupEntity>()
                .WithMany()
                .HasForeignKey(e => e.GroupId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne<EventEntity>()
                .WithMany()
                .HasForeignKey(e => e.EventId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<EventToTaskEntity>(entity =>
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
        });

        modelBuilder.Entity<EventToPurposeEntity>(entity =>
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
        });

        modelBuilder.Entity<EventToSubtaskEntity>(entity =>
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
        });
    }
    
    /// <summary>
    /// Настраивает имена колонок в формате snake_case для всех сущностей
    /// </summary>
    private static void ConfigureSnakeCaseColumnNames(ModelBuilder modelBuilder)
    {
        // Configure for all entities that might have base interface properties
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var entityBuilder = modelBuilder.Entity(entityType.ClrType);
            
            // Configure Id property (from IAutoIdBaseEntity)
            var idProperty = entityType.FindProperty("Id");
            if (idProperty != null && idProperty.PropertyInfo != null)
            {
                entityBuilder.Property("Id").HasColumnName("id");
            }
            
            // Configure CreatedAt property (from ICreatedDateBaseEntity)
            var createdAtProperty = entityType.FindProperty("CreatedAt");
            if (createdAtProperty != null && createdAtProperty.PropertyInfo != null)
            {
                entityBuilder.Property("CreatedAt").HasColumnName("created_at");
            }
            
            // Configure UpdatedAt property (from IUpdatedDateBaseEntity)
            var updatedAtProperty = entityType.FindProperty("UpdatedAt");
            if (updatedAtProperty != null && updatedAtProperty.PropertyInfo != null)
            {
                entityBuilder.Property("UpdatedAt").HasColumnName("updated_at");
            }
            
            // Configure DeactivatedAt property (from ISoftDeleteBaseEntity)
            var deactivatedAtProperty = entityType.FindProperty("DeactivatedAt");
            if (deactivatedAtProperty != null && deactivatedAtProperty.PropertyInfo != null)
            {
                entityBuilder.Property("DeactivatedAt").HasColumnName("deactivated_at");
            }
            
            // Configure IsActive property (from ISoftDeleteBaseEntity)
            var isActiveProperty = entityType.FindProperty("IsActive");
            if (isActiveProperty != null && isActiveProperty.PropertyInfo != null)
            {
                entityBuilder.Property("IsActive").HasColumnName("is_active");
            }
            
            // Configure CreatorUserId property (from ICreatorUserBaseEntity)
            var creatorUserIdProperty = entityType.FindProperty("CreatorUserId");
            if (creatorUserIdProperty != null && creatorUserIdProperty.PropertyInfo != null)
            {
                entityBuilder.Property("CreatorUserId").HasColumnName("creator_user_id");
            }
        }
    }
}
