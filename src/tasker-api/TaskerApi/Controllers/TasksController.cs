using Microsoft.AspNetCore.Mvc;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Responses;
using TaskerApi.Models.Requests;
using AutoMapper;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly IMapper _mapper;

    public TasksController(ITaskService taskService, IMapper mapper)
    {
        _taskService = taskService;
        _mapper = mapper;
    }

    /// <summary>
    /// Получить все задачи.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskResponse>>> GetTasks(
        CancellationToken cancellationToken = default)
    {
        var tasks = await _taskService.GetAllAsync(cancellationToken);
        var responses = _mapper.Map<IEnumerable<TaskResponse>>(tasks);
        return Ok(responses);
    }

    /// <summary>
    /// Получить задачу по ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskResponse>> GetTask(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var task = await _taskService.GetByIdAsync(id, cancellationToken);
        if (task == null)
            return NotFound();

        var response = _mapper.Map<TaskResponse>(task);
        return Ok(response);
    }

    /// <summary>
    /// Создать новую задачу.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TaskResponse>> CreateTask(
        [FromBody] CreateTaskRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var task = await _taskService.CreateAsync(request, cancellationToken);
            var response = _mapper.Map<TaskResponse>(task);
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Обновить задачу.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TaskResponse>> UpdateTask(
        Guid id,
        [FromBody] UpdateTaskRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var task = await _taskService.UpdateAsync(id, request, cancellationToken);
            var response = _mapper.Map<TaskResponse>(task);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Удалить задачу.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteTask(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _taskService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Получить задачи по области.
    /// </summary>
    [HttpGet("area/{areaId:guid}")]
    public async Task<ActionResult<IEnumerable<TaskResponse>>> GetTasksByArea(
        Guid areaId,
        CancellationToken cancellationToken = default)
    {
        var tasks = await _taskService.GetByAreaAsync(areaId, cancellationToken);
        var responses = _mapper.Map<IEnumerable<TaskResponse>>(tasks);
        return Ok(responses);
    }

    /// <summary>
    /// Получить задачи по пользователю.
    /// </summary>
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IEnumerable<TaskResponse>>> GetTasksByUser(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var tasks = await _taskService.GetByUserAsync(userId, cancellationToken);
        var responses = _mapper.Map<IEnumerable<TaskResponse>>(tasks);
        return Ok(responses);
    }

    /// <summary>
    /// Получить активные задачи.
    /// </summary>
    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<TaskResponse>>> GetActiveTasks(
        CancellationToken cancellationToken = default)
    {
        var tasks = await _taskService.GetActiveAsync(cancellationToken);
        var responses = _mapper.Map<IEnumerable<TaskResponse>>(tasks);
        return Ok(responses);
    }
}


