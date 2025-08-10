using Microsoft.AspNetCore.Mvc;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using AutoMapper;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RulesController : ControllerBase
{
    private readonly IRuleService _ruleService;
    private readonly IMapper _mapper;

    public RulesController(IRuleService ruleService, IMapper mapper)
    {
        _ruleService = ruleService;
        _mapper = mapper;
    }

    /// <summary>
    /// Получить все правила.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RuleResponse>>> GetAll(CancellationToken cancellationToken = default)
    {
        var rules = await _ruleService.GetAllAsync(cancellationToken);
        var responses = _mapper.Map<IEnumerable<RuleResponse>>(rules);
        return Ok(responses);
    }

    /// <summary>
    /// Получить правило по идентификатору.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RuleResponse>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var rule = await _ruleService.GetByIdAsync(id, cancellationToken);
        if (rule == null)
            return NotFound();

        return Ok(_mapper.Map<RuleResponse>(rule));
    }

    /// <summary>
    /// Получить правила по области.
    /// </summary>
    [HttpGet("area/{areaId:guid}")]
    public async Task<ActionResult<IEnumerable<RuleResponse>>> GetByArea(Guid areaId, CancellationToken cancellationToken = default)
    {
        var rules = await _ruleService.GetByAreaAsync(areaId, cancellationToken);
        var responses = _mapper.Map<IEnumerable<RuleResponse>>(rules);
        return Ok(responses);
    }

    /// <summary>
    /// Получить активные правила.
    /// </summary>
    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<RuleResponse>>> GetActive(CancellationToken cancellationToken = default)
    {
        var rules = await _ruleService.GetActiveAsync(cancellationToken);
        var responses = _mapper.Map<IEnumerable<RuleResponse>>(rules);
        return Ok(responses);
    }

    /// <summary>
    /// Получить включенные правила.
    /// </summary>
    [HttpGet("enabled")]
    public async Task<ActionResult<IEnumerable<RuleResponse>>> GetEnabled(CancellationToken cancellationToken = default)
    {
        var rules = await _ruleService.GetEnabledAsync(cancellationToken);
        var responses = _mapper.Map<IEnumerable<RuleResponse>>(rules);
        return Ok(responses);
    }

    /// <summary>
    /// Создать новое правило.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<RuleResponse>> Create(CreateRuleRequest request, CancellationToken cancellationToken = default)
    {
        var rule = new RuleEntity
        {
            Id = Guid.NewGuid(),
            AreaId = request.AreaId,
            Name = request.Name,
            IsEnabled = request.IsEnabled,
            Criteria = request.Criteria,
            Action = request.Action,
            Created = DateTimeOffset.UtcNow,
            Updated = DateTimeOffset.UtcNow,
            IsActive = true
        };

        await _ruleService.CreateAsync(rule, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = rule.Id }, _mapper.Map<RuleResponse>(rule));
    }

    /// <summary>
    /// Обновить правило.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<RuleResponse>> Update(Guid id, UpdateRuleRequest request, CancellationToken cancellationToken = default)
    {
        var rule = await _ruleService.GetByIdAsync(id, cancellationToken);
        if (rule == null)
            return NotFound();

        rule.Name = request.Name;
        rule.IsEnabled = request.IsEnabled;
        rule.Criteria = request.Criteria;
        rule.Action = request.Action;
        rule.Updated = DateTimeOffset.UtcNow;

        await _ruleService.UpdateAsync(rule, cancellationToken);
        return Ok(_mapper.Map<RuleResponse>(rule));
    }

    /// <summary>
    /// Включить правило.
    /// </summary>
    [HttpPost("{id:guid}/enable")]
    public async Task<ActionResult> Enable(Guid id, CancellationToken cancellationToken = default)
    {
        await _ruleService.EnableAsync(id, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Отключить правило.
    /// </summary>
    [HttpPost("{id:guid}/disable")]
    public async Task<ActionResult> Disable(Guid id, CancellationToken cancellationToken = default)
    {
        await _ruleService.DisableAsync(id, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Удалить правило.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        await _ruleService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
