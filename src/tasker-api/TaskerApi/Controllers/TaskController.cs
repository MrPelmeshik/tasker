using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskerApi.Attributes;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
[Authorize]
public class TaskController(ITaskService service) : BaseApiController
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
                return NotFound("Задача не найдена");
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
            return Ok(new { success = true, message = "Задача успешно обновлена" });
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
            return Ok(new { success = true, message = "Задача успешно удалена" });
        });

    [HttpGet("{groupId}")]
    [UserLog("Получение кратких карточек задач по группе")]
    public Task<IActionResult> GetTaskSummaryByGroup(Guid groupId, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await service.GetTaskSummaryByGroupAsync(groupId, cancellationToken)));

    [HttpPost]
    [UserLog("Получение недельной активности задач")]
    public Task<IActionResult> GetWeeklyActivity([FromBody] TaskWeeklyActivityRequest request, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await service.GetWeeklyActivityAsync(request, cancellationToken)));
}
