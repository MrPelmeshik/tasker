using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using TaskerApi.Attributes;
using TaskerApi.Constants;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
[Authorize]
public class TaskController(ITaskService service, ILogger<TaskController> logger, IWebHostEnvironment env) : BaseApiController(logger, env)
{
    [HttpGet]
    [UserLog("Получение списка задач")]
    public Task<IActionResult> GetAll(CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await service.GetAsync(cancellationToken)));

    [HttpGet("{id}")]
    [UserLog("Получение задачи по идентификатору")]
    public Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () =>
        {
            var result = await service.GetByIdAsync(id, cancellationToken);
            if (result == null)
                return NotFound(ErrorMessages.TaskNotFound);
            return Ok(result);
        });

    [HttpPost]
    [UserLog("Создание задачи")]
    public Task<IActionResult> Create([FromBody] TaskCreateRequest item, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await service.CreateAsync(item, cancellationToken)));

    [HttpPut("{id}")]
    [UserLog("Обновление задачи")]
    public Task<IActionResult> Update(Guid id, [FromBody] TaskUpdateRequest item, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () =>
        {
            await service.UpdateAsync(id, item, cancellationToken);
            return Ok(new { success = true, message = SuccessMessages.TaskUpdated });
        });

    /// <summary>
    /// Удалить задачу (мягкое удаление — деактивация)
    /// </summary>
    [HttpDelete("{id}")]
    [UserLog("Удаление задачи")]
    public Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () =>
        {
            await service.DeleteAsync(id, cancellationToken);
            return Ok(new { success = true, message = SuccessMessages.TaskDeleted });
        });

    [HttpGet("byFolder/{folderId}")]
    [UserLog("Получение кратких карточек задач по папке")]
    public Task<IActionResult> GetTaskSummaryByFolder(Guid folderId, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await service.GetTaskSummaryByFolderAsync(folderId, cancellationToken)));

    [HttpGet("byAreaRoot/{areaId}")]
    [UserLog("Получение кратких карточек задач в корне области")]
    public Task<IActionResult> GetTaskSummaryByAreaRoot(Guid areaId, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await service.GetTaskSummaryByAreaRootAsync(areaId, cancellationToken)));

    [HttpPost]
    [UserLog("Получение недельной активности задач")]
    public Task<IActionResult> GetWeeklyActivity([FromBody] TaskWeeklyActivityRequest request, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await service.GetWeeklyActivityAsync(request, cancellationToken)));

    /// <summary>
    /// Получить задачи с активностями по гибкому фильтру (диапазон дат, статусы, пагинация)
    /// </summary>
    [HttpPost]
    [UserLog("Получение задач с активностями")]
    public Task<IActionResult> GetTasksWithActivities([FromBody] TaskWithActivitiesFilterRequest request, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await service.GetTasksWithActivitiesAsync(request, cancellationToken)));
}
