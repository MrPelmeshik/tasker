using Microsoft.AspNetCore.Mvc;
using TaskerApi.Attributes;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
public class GroupController(IGroupService service) : ControllerBase
{
    [HttpGet]
    [UserLog("Получение списка групп")]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    { 
        try 
        {
            return Ok(await service.GetAsync(cancellationToken));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet("{id}")]
    [UserLog("Получение группы по идентификатору")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    { 
        try 
        {
            var result = await service.GetByIdAsync(id, cancellationToken);
            if (result == null)
            {
                return NotFound("Группа не найдена");
            }
            return Ok(result);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    [HttpPost]
    [UserLog("Создание группы")]
    public async Task<IActionResult> Create([FromBody]GroupCreateRequest item, CancellationToken cancellationToken)
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
    [UserLog("Обновление группы")]
    public async Task<IActionResult> Update(Guid id, [FromBody]GroupUpdateRequest item, CancellationToken cancellationToken)
    {
        try
        {
            await service.UpdateAsync(id, item, cancellationToken);
            return Ok(new { success = true, message = "Группа успешно обновлена" });
        }
        catch (KeyNotFoundException)
        {
            return NotFound("Группа не найдена");
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid("Нет доступа к указанной группе");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}
