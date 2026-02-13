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
public class AreaController(IAreaService service, IAreaMemberService memberService) : BaseApiController
{
    [HttpGet]
    [UserLog("Получение списка областей")]
    public Task<IActionResult> GetAll(CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await service.GetAllAsync(cancellationToken)));

    [HttpGet("{id}")]
    [UserLog("Получение области по идентификатору")]
    public Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () =>
        {
            var result = await service.GetByIdAsync(id, cancellationToken);
            if (result == null)
                return NotFound("Область не найдена");
            return Ok(result);
        });

    [HttpPost]
    [UserLog("Создание области")]
    public Task<IActionResult> Create([FromBody] AreaCreateRequest item, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await service.CreateAsync(item, cancellationToken)));

    [HttpPut("{id}")]
    [UserLog("Обновление области")]
    public Task<IActionResult> Update(Guid id, [FromBody] AreaUpdateRequest item, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () =>
        {
            await service.UpdateAsync(id, item, cancellationToken);
            return Ok(new { success = true, message = "Область успешно обновлена" });
        });

    /// <summary>
    /// Удалить область (мягкое удаление — деактивация)
    /// </summary>
    [HttpDelete("{id}")]
    [UserLog("Удаление области")]
    public Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () =>
        {
            await service.DeleteAsync(id, cancellationToken);
            return Ok(new { success = true, message = "Область успешно удалена" });
        });

    [HttpGet]
    [UserLog("Получение кратких карточек областей")]
    public Task<IActionResult> GetAreaShortCard(CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await service.GetAreaShortCardAsync(cancellationToken)));

    /// <summary>
    /// Получить список участников области
    /// </summary>
    [HttpGet("{areaId}")]
    [UserLog("Получение участников области")]
    public Task<IActionResult> GetMembers(Guid areaId, CancellationToken cancellationToken = default)
        => ExecuteWithExceptionHandling(async () => Ok(await memberService.GetMembersAsync(areaId, cancellationToken)));

    /// <summary>
    /// Назначить роль участнику области
    /// </summary>
    [HttpPost("{areaId}")]
    [UserLog("Назначение участника области")]
    public Task<IActionResult> AddMember(Guid areaId, [FromBody] AddAreaMemberRequest request, CancellationToken cancellationToken = default)
        => ExecuteWithExceptionHandling(async () =>
        {
            await memberService.AddMemberAsync(areaId, request, cancellationToken);
            return Ok(new { success = true, message = "Участник назначен" });
        });

    /// <summary>
    /// Удалить участника из области
    /// </summary>
    [HttpDelete("{areaId}/{userId}")]
    [UserLog("Удаление участника области")]
    public Task<IActionResult> RemoveMember(Guid areaId, Guid userId, CancellationToken cancellationToken = default)
        => ExecuteWithExceptionHandling(async () =>
        {
            await memberService.RemoveMemberAsync(areaId, userId, cancellationToken);
            return Ok(new { success = true, message = "Участник удалён" });
        });

    /// <summary>
    /// Передать роль владельца области другому пользователю
    /// </summary>
    [HttpPost("{areaId}/transfer-owner")]
    [UserLog("Передача роли владельца области")]
    public Task<IActionResult> TransferOwner(Guid areaId, [FromBody] TransferOwnerRequest request, CancellationToken cancellationToken = default)
        => ExecuteWithExceptionHandling(async () =>
        {
            await memberService.TransferOwnerAsync(areaId, request, cancellationToken);
            return Ok(new { success = true, message = "Роль владельца передана" });
        });
}
