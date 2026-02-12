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
public class GroupController(IGroupService service) : BaseApiController
{
    [HttpGet]
    [UserLog("Получение списка групп")]
    public Task<IActionResult> GetAll(CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await service.GetAsync(cancellationToken)));

    [HttpGet("{id}")]
    [UserLog("Получение группы по идентификатору")]
    public Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () =>
        {
            var result = await service.GetByIdAsync(id, cancellationToken);
            if (result == null)
                return NotFound("Группа не найдена");
            return Ok(result);
        });

    [HttpPost]
    [UserLog("Создание группы")]
    public Task<IActionResult> Create([FromBody] GroupCreateRequest item, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await service.CreateAsync(item, cancellationToken)));

    [HttpPut("{id}")]
    [UserLog("Обновление группы")]
    public Task<IActionResult> Update(Guid id, [FromBody] GroupUpdateRequest item, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () =>
        {
            await service.UpdateAsync(id, item, cancellationToken);
            return Ok(new { success = true, message = "Группа успешно обновлена" });
        });

    /// <summary>
    /// Удалить группу (мягкое удаление — деактивация)
    /// </summary>
    [HttpDelete("{id}")]
    [UserLog("Удаление группы")]
    public Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () =>
        {
            await service.DeleteAsync(id, cancellationToken);
            return Ok(new { success = true, message = "Группа успешно удалена" });
        });

    [HttpGet("{areaId}")]
    [UserLog("Получение кратких карточек групп по области")]
    public Task<IActionResult> GetGroupShortCardByArea(Guid areaId, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await service.GetGroupShortCardByAreaAsync(areaId, cancellationToken)));
}
