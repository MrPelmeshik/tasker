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
public class TaskController(ITaskService service) : ControllerBase
{
    [HttpGet]
    [UserLog("Получение списка задач")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
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
    [UserLog("Получение задачи по идентификатору")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    { 
        try 
        {
            var result = await service.GetByIdAsync(id, cancellationToken);
            if (result == null)
            {
                return NotFound("Задача не найдена");
            }
            return Ok(result);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    [HttpPost]
    [UserLog("Создание задачи")]
    public async Task<IActionResult> Create([FromBody]TaskCreateRequest item, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await service.CreateAsync(item, cancellationToken)); 
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid("Нет доступа к указанной группе");
        }
        catch (KeyNotFoundException e)
        {
            return NotFound(e.Message);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPut("{id}")]
    [UserLog("Обновление задачи")]
    public async Task<IActionResult> Update(Guid id, [FromBody]TaskUpdateRequest item, CancellationToken cancellationToken)
    {
        try
        {
            await service.UpdateAsync(id, item, cancellationToken);
            return Ok(new { success = true, message = "Задача успешно обновлена" });
        }
        catch (KeyNotFoundException)
        {
            return NotFound("Задача не найдена");
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid("Нет доступа к указанной задаче или группе");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet("{groupId}")]
    [UserLog("Получение кратких карточек задач по группе")]
    public async Task<IActionResult> GetTaskSummaryByGroup(Guid groupId, CancellationToken cancellationToken)
    { 
        try 
        {
            return Ok(await service.GetTaskSummaryByGroupAsync(groupId, cancellationToken));
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

    [HttpPost]
    [UserLog("Получение недельной активности задач")]
    public async Task<IActionResult> GetWeeklyActivity([FromBody]TaskWeeklyActivityRequest request, CancellationToken cancellationToken)
    { 
        try 
        {
            return Ok(await service.GetWeeklyActivityAsync(request, cancellationToken));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}
