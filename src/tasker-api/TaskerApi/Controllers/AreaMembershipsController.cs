using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskerApi.Attributes;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using AutoMapper;

namespace TaskerApi.Controllers;

/// <summary>
/// Контроллер для управления членством пользователей в областях.
/// </summary>
[ApiController]
[Route("api/areas/{areaId:guid}/memberships")]
[Authorize]
public class AreaMembershipsController : ControllerBase
{
    private readonly IAreaMembershipService _service;
    private readonly IMapper _mapper;

    public AreaMembershipsController(IAreaMembershipService service, IMapper mapper)
    {
        _service = service;
        _mapper = mapper;
    }

    /// <summary>
    /// Получить всех участников области.
    /// </summary>
    [HttpGet]
    [UserActionLog("Получение участников области")]
    public async Task<ActionResult<IEnumerable<AreaMembershipResponse>>> GetByArea([FromRoute] Guid areaId, CancellationToken cancellationToken)
    {
        var entities = await _service.GetByAreaAsync(areaId, cancellationToken);
        var responses = _mapper.Map<IEnumerable<AreaMembershipResponse>>(entities);
        return Ok(responses);
    }

    /// <summary>
    /// Получить участника области по идентификатору.
    /// </summary>
    [HttpGet("{id:guid}")]
    [UserActionLog("Получение участника области по идентификатору")]
    public async Task<ActionResult<AreaMembershipResponse>> GetById([FromRoute] Guid areaId, [FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var entity = await _service.GetAsync(id, cancellationToken);
        if (entity == null || entity.AreaId != areaId)
            return NotFound();

        return Ok(_mapper.Map<AreaMembershipResponse>(entity));
    }

    /// <summary>
    /// Добавить пользователя в область.
    /// </summary>
    [HttpPost]
    [UserActionLog("Добавление пользователя в область")]
    public async Task<ActionResult<AreaMembershipResponse>> AddMember(
        [FromRoute] Guid areaId,
        [FromBody] AddMemberRequest request,
        CancellationToken cancellationToken)
    {
        var membershipId = await _service.AddMemberAsync(areaId, request.UserId, request.Role, cancellationToken);
        
        var entity = new AreaMembershipEntity
        {
            Id = membershipId,
            AreaId = areaId,
            UserId = request.UserId,
            Role = request.Role,
            Joined = DateTimeOffset.UtcNow,
            IsActive = true,
            Created = DateTimeOffset.UtcNow,
            Updated = DateTimeOffset.UtcNow
        };

        return CreatedAtAction(nameof(GetById), new { areaId, id = membershipId }, _mapper.Map<AreaMembershipResponse>(entity));
    }

    /// <summary>
    /// Удалить пользователя из области.
    /// </summary>
    [HttpDelete("{userId:guid}")]
    [UserActionLog("Удаление пользователя из области")]
    public async Task<IActionResult> RemoveMember(
        [FromRoute] Guid areaId,
        [FromRoute] Guid userId,
        CancellationToken cancellationToken)
    {
        await _service.RemoveMemberAsync(areaId, userId, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Изменить роль участника.
    /// </summary>
    [HttpPut("{userId:guid}/role")]
    [UserActionLog("Изменение роли участника")]
    public async Task<IActionResult> ChangeRole(
        [FromRoute] Guid areaId,
        [FromRoute] Guid userId,
        [FromBody] ChangeRoleRequest request,
        CancellationToken cancellationToken)
    {
        await _service.ChangeRoleAsync(areaId, userId, request.NewRole, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Проверить, является ли пользователь участником области.
    /// </summary>
    [HttpGet("check/{userId:guid}")]
    [UserActionLog("Проверка участия пользователя в области")]
    public async Task<ActionResult<MembershipCheckResponse>> CheckMembership(
        [FromRoute] Guid areaId,
        [FromRoute] Guid userId,
        CancellationToken cancellationToken)
    {
        var isMember = await _service.IsMemberAsync(areaId, userId, cancellationToken);
        return Ok(new MembershipCheckResponse { IsMember = isMember });
    }
}






