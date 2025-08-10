using TaskerApi.Interfaces.Services;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Entities;
using TaskerApi.Infrastructure;
using System.Data;
using Dapper;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для управления связями между действиями и задачами.
/// </summary>
public class ActionTaskService : IActionTaskService
{
    private readonly IUnitOfWorkFactory _unitOfWorkFactory;
    private readonly IActionProvider _actionProvider;
    private readonly ITaskProvider _taskProvider;

    public ActionTaskService(
        IUnitOfWorkFactory unitOfWorkFactory,
        IActionProvider actionProvider,
        ITaskProvider taskProvider)
    {
        _unitOfWorkFactory = unitOfWorkFactory;
        _actionProvider = actionProvider;
        _taskProvider = taskProvider;
    }

    /// <summary>
    /// Связать действие с задачей.
    /// </summary>
    public async Task LinkActionToTaskAsync(Guid actionId, Guid taskId, int relationKindId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            INSERT INTO action_task (id, action_id, task_id, relation_id, created, is_active)
            VALUES (@Id, @ActionId, @TaskId, @RelationId, @Created, @IsActive)
            ON CONFLICT (action_id, task_id, relation_id) DO UPDATE SET
                is_active = @IsActive,
                deactivated = NULL";

        var link = new ActionTaskEntity
        {
            Id = Guid.NewGuid(),
            ActionId = actionId,
            TaskId = taskId,
            RelationId = relationKindId,
            Created = DateTimeOffset.UtcNow,
            IsActive = true
        };

        await connection.ExecuteAsync(sql, link);
    }

    /// <summary>
    /// Отвязать действие от задачи.
    /// </summary>
    public async Task UnlinkActionFromTaskAsync(Guid actionId, Guid taskId, int relationKindId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            UPDATE action_task 
            SET is_active = false, deactivated = @Deactivated
            WHERE action_id = @ActionId AND task_id = @TaskId AND relation_id = @RelationId AND is_active = true";

        await connection.ExecuteAsync(sql, new 
        { 
            ActionId = actionId, 
            TaskId = taskId, 
            RelationId = relationKindId, 
            Deactivated = DateTimeOffset.UtcNow 
        });
    }

    /// <summary>
    /// Получить все задачи, связанные с действием.
    /// </summary>
    public async Task<IEnumerable<TaskEntity>> GetTasksForActionAsync(Guid actionId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            SELECT t.id, t.area_id, t.title, t.description, t.status_id, t.visibility_id, 
                   t.user_id, t.created, t.updated, t.closed, t.is_active, t.deactivated
            FROM tasks t
            INNER JOIN action_task at ON t.id = at.task_id AND at.is_active
            WHERE at.action_id = @ActionId AND t.is_active = true
            ORDER BY t.created DESC";

        return await connection.QueryAsync<TaskEntity>(sql, new { ActionId = actionId });
    }

    /// <summary>
    /// Получить все действия, связанные с задачей.
    /// </summary>
    public async Task<IEnumerable<ActionEntity>> GetActionsForTaskAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            SELECT a.id, a.area_id, a.user_id, a.verb_id, a.summary, a.note, a.started, 
                   a.ended, a.duration_sec, a.visibility_id, a.context, a.is_active, 
                   a.deactivated, a.created, a.updated
            FROM actions a
            INNER JOIN action_task at ON a.id = at.action_id AND at.is_active
            WHERE at.task_id = @TaskId AND a.is_active = true
            ORDER BY a.started DESC";

        return await connection.QueryAsync<ActionEntity>(sql, new { TaskId = taskId });
    }

    /// <summary>
    /// Получить статистику по задаче.
    /// </summary>
    public async Task<TaskStatistics> GetTaskStatisticsAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            SELECT 
                COUNT(DISTINCT at.action_id) as actions_count,
                COALESCE(SUM(a.duration_sec), 0) as total_duration_sec,
                COUNT(DISTINCT CASE WHEN a.ended IS NOT NULL THEN at.action_id END) as completed_actions_count
            FROM action_task at
            INNER JOIN actions a ON at.action_id = a.id AND at.is_active AND a.is_active
            WHERE at.task_id = @TaskId";

        var result = await connection.QueryFirstOrDefaultAsync(sql, new { TaskId = taskId });
        
        return new TaskStatistics
        {
            TaskId = taskId,
            ActionsCount = result?.actions_count ?? 0,
            TotalDurationSec = result?.total_duration_sec ?? 0,
            CompletedActionsCount = result?.completed_actions_count ?? 0
        };
    }
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
