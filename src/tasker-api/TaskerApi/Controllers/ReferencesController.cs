using Microsoft.AspNetCore.Mvc;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Responses;
using AutoMapper;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReferencesController : ControllerBase
{
    private readonly IReferenceService _referenceService;
    private readonly IMapper _mapper;

    public ReferencesController(IReferenceService referenceService, IMapper mapper)
    {
        _referenceService = referenceService;
        _mapper = mapper;
    }

    /// <summary>
    /// Получить все статусы задач.
    /// </summary>
    [HttpGet("task-statuses")]
    public async Task<ActionResult<IEnumerable<TaskStatusRefResponse>>> GetTaskStatuses(CancellationToken cancellationToken = default)
    {
        var statuses = await _referenceService.GetTaskStatusesAsync(cancellationToken);
        var responses = _mapper.Map<IEnumerable<TaskStatusRefResponse>>(statuses);
        return Ok(responses);
    }

    /// <summary>
    /// Получить все уровни видимости.
    /// </summary>
    [HttpGet("visibility-levels")]
    public async Task<ActionResult<IEnumerable<VisibilityRefResponse>>> GetVisibilityLevels(CancellationToken cancellationToken = default)
    {
        var levels = await _referenceService.GetVisibilityLevelsAsync(cancellationToken);
        var responses = _mapper.Map<IEnumerable<VisibilityRefResponse>>(levels);
        return Ok(responses);
    }

    /// <summary>
    /// Получить все глаголы действий.
    /// </summary>
    [HttpGet("action-verbs")]
    public async Task<ActionResult<IEnumerable<ActionVerbResponse>>> GetActionVerbs(CancellationToken cancellationToken = default)
    {
        var verbs = await _referenceService.GetActionVerbsAsync(cancellationToken);
        var responses = _mapper.Map<IEnumerable<ActionVerbResponse>>(verbs);
        return Ok(responses);
    }

    /// <summary>
    /// Получить все типы связей.
    /// </summary>
    [HttpGet("relation-kinds")]
    public async Task<ActionResult<IEnumerable<RelationKindRefResponse>>> GetRelationKinds(CancellationToken cancellationToken = default)
    {
        var kinds = await _referenceService.GetRelationKindsAsync(cancellationToken);
        var responses = _mapper.Map<IEnumerable<RelationKindRefResponse>>(kinds);
        return Ok(responses);
    }
}
