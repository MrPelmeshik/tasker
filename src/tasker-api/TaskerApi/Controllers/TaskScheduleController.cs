using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskerApi.Attributes;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Requests;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
[Authorize]
public class TaskScheduleController(
    ITaskScheduleService taskScheduleService,
    ILogger<TaskScheduleController> logger,
    IWebHostEnvironment env) : BaseApiController(logger, env)
{
    [HttpPost]
    [UserLog("Создание расписания задачи")]
    public Task<IActionResult> Create([FromBody] TaskScheduleCreateRequest request, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await taskScheduleService.CreateAsync(request, cancellationToken)));

    [HttpPut("{id:guid}")]
    [UserLog("Обновление расписания задачи")]
    public Task<IActionResult> Update(Guid id, [FromBody] TaskScheduleUpdateRequest request, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await taskScheduleService.UpdateAsync(id, request, cancellationToken)));

    [HttpDelete("{id:guid}")]
    [UserLog("Удаление расписания задачи")]
    public Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () =>
        {
            await taskScheduleService.DeleteAsync(id, cancellationToken);
            return NoContent();
        });

    [HttpGet("byTask/{taskId:guid}")]
    [UserLog("Получение расписаний по задаче")]
    public Task<IActionResult> GetByTaskId(Guid taskId, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await taskScheduleService.GetByTaskIdAsync(taskId, cancellationToken)));

    [HttpPost]
    [UserLog("Получение расписаний за неделю")]
    public Task<IActionResult> GetByWeek([FromBody] WeekStartRequest request, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await taskScheduleService.GetByWeekAsync(request.WeekStartIso, cancellationToken)));
}

/// <summary>
/// Запрос с датой начала недели
/// </summary>
public class WeekStartRequest
{
    public string WeekStartIso { get; set; } = string.Empty;
}
