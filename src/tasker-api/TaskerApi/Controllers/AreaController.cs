using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskerApi.Attributes;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Services;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
[Authorize]
public class AreaController(IAreaService service, IAreaMemberService memberService) : ControllerBase
{
    [HttpGet]
    [UserLog("Получение списка областей")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    { 
        try 
        {
            return Ok(await service.GetAllAsync(cancellationToken));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    [HttpGet("{id}")]
    [UserLog("Получение области по идентификатору")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    { 
        try 
        {
            var result = await service.GetByIdAsync(id, cancellationToken);
            if (result == null)
            {
                return NotFound("Область не найдена");
            }
            return Ok(result);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    [HttpPost]
    [UserLog("Создание области")]
    public async Task<IActionResult> Create([FromBody]AreaCreateRequest item, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await service.CreateAsync(item, cancellationToken)); 
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPut("{id}")]
    [UserLog("Обновление области")]
    public async Task<IActionResult> Update(Guid id, [FromBody]AreaUpdateRequest item, CancellationToken cancellationToken)
    {
        try
        {
            await service.UpdateAsync(id, item, cancellationToken);
            return Ok(new { success = true, message = "Область успешно обновлена" });
        }
        catch (KeyNotFoundException)
        {
            return NotFound("Область не найдена");
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid("Нет доступа к указанной области");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    /// <summary>
    /// Удалить область (мягкое удаление — деактивация)
    /// </summary>
    [HttpDelete("{id}")]
    [UserLog("Удаление области")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await service.DeleteAsync(id, cancellationToken);
            return Ok(new { success = true, message = "Область успешно удалена" });
        }
        catch (KeyNotFoundException)
        {
            return NotFound("Область не найдена");
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid("Нет доступа к указанной области");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet]
    [UserLog("Получение кратких карточек областей")]
    public async Task<IActionResult> GetAreaShortCard(CancellationToken cancellationToken)
    { 
        try 
        {
            return Ok(await service.GetAreaShortCardAsync(cancellationToken));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    /// <summary>
    /// Создать область с группой по умолчанию (сложная операция с транзакцией)
    /// </summary>
    [HttpPost("with-group")]
    [UserLog("Создание области с группой по умолчанию")]
    public async Task<IActionResult> CreateWithDefaultGroup([FromBody] CreateAreaWithGroupRequest request, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await service.CreateWithDefaultGroupAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = result.Area.Id }, result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Получить список участников области
    /// </summary>
    [HttpGet("{areaId}")]
    [UserLog("Получение участников области")]
    public async Task<IActionResult> GetMembers(Guid areaId, CancellationToken cancellationToken = default)
    {
        try
        {
            var members = await memberService.GetMembersAsync(areaId, cancellationToken);
            return Ok(members);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid("Нет доступа к области");
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Назначить роль участнику области
    /// </summary>
    [HttpPost("{areaId}")]
    [UserLog("Назначение участника области")]
    public async Task<IActionResult> AddMember(Guid areaId, [FromBody] AddAreaMemberRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            await memberService.AddMemberAsync(areaId, request, cancellationToken);
            return Ok(new { success = true, message = "Участник назначен" });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid("Нет прав на назначение участников");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Удалить участника из области
    /// </summary>
    [HttpDelete("{areaId}/{userId}")]
    [UserLog("Удаление участника области")]
    public async Task<IActionResult> RemoveMember(Guid areaId, Guid userId, CancellationToken cancellationToken = default)
    {
        try
        {
            await memberService.RemoveMemberAsync(areaId, userId, cancellationToken);
            return Ok(new { success = true, message = "Участник удалён" });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid("Нет прав на удаление участников");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Передать роль владельца области другому пользователю
    /// </summary>
    [HttpPost("{areaId}/transfer-owner")]
    [UserLog("Передача роли владельца области")]
    public async Task<IActionResult> TransferOwner(Guid areaId, [FromBody] TransferOwnerRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            await memberService.TransferOwnerAsync(areaId, request, cancellationToken);
            return Ok(new { success = true, message = "Роль владельца передана" });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid("Только владелец может передать роль");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}