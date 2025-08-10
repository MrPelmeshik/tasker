using Microsoft.AspNetCore.Mvc;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Responses;
using TaskerApi.Models.Requests;
using AutoMapper;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActionsController : ControllerBase
{
    private readonly IActionService _actionService;
    private readonly IMapper _mapper;

    public ActionsController(IActionService actionService, IMapper mapper)
    {
        _actionService = actionService;
        _mapper = mapper;
    }

    /// <summary>
    /// Получить все действия.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ActionResponse>>> GetActions(
        CancellationToken cancellationToken = default)
    {
        var actions = await _actionService.GetAllAsync(cancellationToken);
        var responses = _mapper.Map<IEnumerable<ActionResponse>>(actions);
        return Ok(responses);
    }

    /// <summary>
    /// Получить действие по ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ActionResponse>> GetAction(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var action = await _actionService.GetByIdAsync(id, cancellationToken);
        if (action == null)
            return NotFound();

        var response = _mapper.Map<ActionResponse>(action);
        return Ok(response);
    }

    /// <summary>
    /// Создать новое действие.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ActionResponse>> CreateAction(
        [FromBody] CreateActionRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var action = await _actionService.CreateAsync(request, cancellationToken);
            var response = _mapper.Map<ActionResponse>(action);
            return CreatedAtAction(nameof(GetAction), new { id = action.Id }, response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Обновить действие.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ActionResponse>> UpdateAction(
        Guid id,
        [FromBody] UpdateActionRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var action = await _actionService.UpdateAsync(id, request, cancellationToken);
            var response = _mapper.Map<ActionResponse>(action);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Удалить действие.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteAction(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _actionService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Получить действия по области.
    /// </summary>
    [HttpGet("area/{areaId:guid}")]
    public async Task<ActionResult<IEnumerable<ActionResponse>>> GetActionsByArea(
        Guid areaId,
        CancellationToken cancellationToken = default)
    {
        var actions = await _actionService.GetByAreaAsync(areaId, cancellationToken);
        var responses = _mapper.Map<IEnumerable<ActionResponse>>(actions);
        return Ok(responses);
    }

    /// <summary>
    /// Получить действия по пользователю.
    /// </summary>
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IEnumerable<ActionResponse>>> GetActionsByUser(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var actions = await _actionService.GetByUserAsync(userId, cancellationToken);
        var responses = _mapper.Map<IEnumerable<ActionResponse>>(actions);
        return Ok(responses);
    }
}
