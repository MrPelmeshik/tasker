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
public class AreaController(IAreaService service) : ControllerBase
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
}