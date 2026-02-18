using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Models.Entities;

namespace TaskerApi.Models.Entities;

/// <summary>
/// Планирование задачи — временной слот.
/// </summary>
[Table("task_schedules")]
public class TaskScheduleEntity :
    IDbEntity,
    IAutoIdBaseEntity<Guid>,
    ISoftDeleteBaseEntity,
    ICreatedDateBaseEntity,
    IUpdatedDateBaseEntity,
    IOwnerUserBaseEntity
{
    /// <summary>
    /// ID задачи (FK → tasks)
    /// </summary>
    [Column("task_id")]
    public Guid TaskId { get; set; }

    /// <summary>
    /// Начало временного слота
    /// </summary>
    [Column("start_at")]
    public DateTimeOffset StartAt { get; set; }

    /// <summary>
    /// Конец временного слота
    /// </summary>
    [Column("end_at")]
    public DateTimeOffset EndAt { get; set; }

    /// <summary>
    /// Навигационное свойство к задаче (для каскадного query filter)
    /// </summary>
    public TaskEntity? Task { get; set; }

    public Guid Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public Guid OwnerUserId { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset? DeactivatedAt { get; set; }
}
