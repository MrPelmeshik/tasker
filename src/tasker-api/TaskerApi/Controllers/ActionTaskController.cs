using Microsoft.AspNetCore.Mvc;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Responses;
using TaskerApi.Models.Requests;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActionTaskController : ControllerBase
{
    private readonly IActionTaskService _actionTaskService;

    public ActionTaskController(IActionTaskService actionTaskService)
    {
        _actionTaskService = actionTaskService;
    }

    /// <summary>
    /// Связать действие с задачей.
    /// </summary>
    [HttpPost("link")]
    public async Task<ActionResult> LinkActionToTask(
        [FromBody] LinkActionTaskRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _actionTaskService.LinkActionToTaskAsync(
                request.ActionId, 
                request.TaskId, 
                request.RelationKindId, 
                cancellationToken);
            
            return Ok(new { message = "Действие успешно связано с задачей" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Отвязать действие от задачи.
    /// </summary>
    [HttpPost("unlink")]
    public async Task<ActionResult> UnlinkActionFromTask(
        [FromBody] LinkActionTaskRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _actionTaskService.UnlinkActionFromTaskAsync(
                request.ActionId, 
                request.TaskId, 
                request.RelationKindId, 
                cancellationToken);
            
            return Ok(new { message = "Действие успешно отвязано от задачи" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Получить все задачи, связанные с действием.
    /// </summary>
    [HttpGet("action/{actionId:guid}/tasks")]
    public async Task<ActionResult<IEnumerable<TaskResponse>>> GetTasksForAction(
        Guid actionId,
        CancellationToken cancellationToken = default)
    {
        var tasks = await _actionTaskService.GetTasksForActionAsync(actionId, cancellationToken);
        var responses = tasks.Select(MapToTaskResponse);
        return Ok(responses);
    }

    /// <summary>
    /// Получить все действия, связанные с задачей.
    /// </summary>
    [HttpGet("task/{taskId:guid}/actions")]
    public async Task<ActionResult<IEnumerable<ActionResponse>>> GetActionsForTask(
        Guid taskId,
        CancellationToken cancellationToken = default)
    {
        var actions = await _actionTaskService.GetActionsForTaskAsync(taskId, cancellationToken);
        var responses = actions.Select(MapToActionResponse);
        return Ok(responses);
    }

    /// <summary>
    /// Получить статистику по задаче.
    /// </summary>
    [HttpGet("task/{taskId:guid}/statistics")]
    public async Task<ActionResult<TaskStatisticsResponse>> GetTaskStatistics(
        Guid taskId,
        CancellationToken cancellationToken = default)
    {
        var statistics = await _actionTaskService.GetTaskStatisticsAsync(taskId, cancellationToken);
        var response = MapToTaskStatisticsResponse(statistics);
        return Ok(response);
    }

    private static TaskResponse MapToTaskResponse(TaskEntity task)
    {
        return new TaskResponse
        {
            Id = task.Id,
            AreaId = task.AreaId,
            Title = task.Title,
            Description = task.Description,
            StatusId = task.StatusId,
            VisibilityId = task.VisibilityId,
            UserId = task.UserId,
            Created = task.Created,
            Updated = task.Updated,
            Closed = task.Closed,
            IsActive = task.IsActive
        };
    }

    private static ActionResponse MapToActionResponse(ActionEntity action)
    {
        return new ActionResponse
        {
            Id = action.Id,
            AreaId = action.AreaId,
            UserId = action.UserId,
            VerbId = action.VerbId,
            Summary = action.Summary,
            Note = action.Note,
            Started = action.Started,
            Ended = action.Ended,
            DurationSec = action.DurationSec,
            VisibilityId = action.VisibilityId,
            Context = action.Context,
            Created = action.Created,
            Updated = action.Updated,
            IsActive = action.IsActive
        };
    }

    private static TaskStatisticsResponse MapToTaskStatisticsResponse(TaskStatistics statistics)
    {
        return new TaskStatisticsResponse
        {
            TaskId = statistics.TaskId,
            ActionsCount = statistics.ActionsCount,
            TotalDurationSec = statistics.TotalDurationSec,
            CompletedActionsCount = statistics.CompletedActionsCount
        };
    }
}
