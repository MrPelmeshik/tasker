using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Интерфейс сервиса для управления связями между действиями и задачами.
/// </summary>
public interface IActionTaskService
{
    /// <summary>
    /// Связать действие с задачей.
    /// </summary>
    Task LinkActionToTaskAsync(Guid actionId, Guid taskId, int relationKindId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Отвязать действие от задачи.
    /// </summary>
    Task UnlinkActionFromTaskAsync(Guid actionId, Guid taskId, int relationKindId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить все задачи, связанные с действием.
    /// </summary>
    Task<IEnumerable<TaskEntity>> GetTasksForActionAsync(Guid actionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить все действия, связанные с задачей.
    /// </summary>
    Task<IEnumerable<ActionEntity>> GetActionsForTaskAsync(Guid taskId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить статистику по задаче.
    /// </summary>
    Task<TaskStatistics> GetTaskStatisticsAsync(Guid taskId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Статистика по задаче.
/// </summary>
public class TaskStatistics
{
    public Guid TaskId { get; set; }
    public int ActionsCount { get; set; }
    public int TotalDurationSec { get; set; }
    public int CompletedActionsCount { get; set; }
}
