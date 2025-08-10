using Microsoft.AspNetCore.Mvc;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Responses;
using TaskerApi.Models.Requests;
using AutoMapper;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserActionLogsController : ControllerBase
{
    private readonly IUserActionLogService _userActionLogService;
    private readonly IMapper _mapper;

    public UserActionLogsController(IUserActionLogService userActionLogService, IMapper mapper)
    {
        _userActionLogService = userActionLogService;
        _mapper = mapper;
    }

    /// <summary>
    /// Получить все логи действий.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserActionLogResponse>>> GetAll(CancellationToken cancellationToken = default)
    {
        var logs = await _userActionLogService.GetAllAsync(cancellationToken);
        var responses = _mapper.Map<IEnumerable<UserActionLogResponse>>(logs);
        return Ok(responses);
    }

    /// <summary>
    /// Получить лог действия по идентификатору.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserActionLogResponse>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var log = await _userActionLogService.GetByIdAsync(id, cancellationToken);
        if (log == null)
            return NotFound();

        return Ok(_mapper.Map<UserActionLogResponse>(log));
    }

    /// <summary>
    /// Получить логи действий пользователя.
    /// </summary>
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IEnumerable<UserActionLogResponse>>> GetByUser(Guid userId, CancellationToken cancellationToken = default)
    {
        var logs = await _userActionLogService.GetByUserAsync(userId, cancellationToken);
        var responses = _mapper.Map<IEnumerable<UserActionLogResponse>>(logs);
        return Ok(responses);
    }

    /// <summary>
    /// Получить логи действий по временному диапазону.
    /// </summary>
    [HttpGet("timerange")]
    public async Task<ActionResult<IEnumerable<UserActionLogResponse>>> GetByTimeRange(
        [FromQuery] DateTimeOffset from,
        [FromQuery] DateTimeOffset to,
        CancellationToken cancellationToken = default)
    {
        var logs = await _userActionLogService.GetByTimeRangeAsync(from, to, cancellationToken);
        var responses = _mapper.Map<IEnumerable<UserActionLogResponse>>(logs);
        return Ok(responses);
    }

    /// <summary>
    /// Получить логи действий по типу действия.
    /// </summary>
    [HttpGet("action/{action}")]
    public async Task<ActionResult<IEnumerable<UserActionLogResponse>>> GetByAction(string action, CancellationToken cancellationToken = default)
    {
        var logs = await _userActionLogService.GetByActionAsync(action, cancellationToken);
        var responses = _mapper.Map<IEnumerable<UserActionLogResponse>>(logs);
        return Ok(responses);
    }

    /// <summary>
    /// Записать новое действие пользователя.
    /// </summary>
    [HttpPost("log")]
    public async Task<ActionResult<UserActionLogResponse>> LogAction(
        [FromBody] LogActionRequest request,
        CancellationToken cancellationToken = default)
    {
        await _userActionLogService.LogActionAsync(
            request.UserId,
            request.Action,
            request.Details,
            request.IpAddress,
            request.UserAgent,
            cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Удалить лог действия.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        await _userActionLogService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
