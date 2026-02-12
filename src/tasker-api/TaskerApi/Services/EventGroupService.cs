using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Services.Base;
using TaskerApi.Services.Mapping;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для работы с событиями групп
/// </summary>
public class EventGroupService(
    ILogger<EventGroupService> logger,
    ICurrentUserService currentUser,
    IEventRepository eventRepository,
    IGroupRepository groupRepository,
    IAreaRoleService areaRoleService,
    TaskerDbContext context)
    : BaseEventEntityService(logger, currentUser, eventRepository, areaRoleService, context), IEventGroupService
{
    /// <inheritdoc />
    public Task<EventCreateResponse> AddEventAsync(EventCreateEntityRequest item, CancellationToken cancellationToken)
        => AddEventCoreAsync(item, cancellationToken);

    /// <inheritdoc />
    public async Task<IReadOnlyList<EventResponse>> GetEventsByGroupIdAsync(Guid groupId, CancellationToken cancellationToken)
    {
        return await GetEventsCoreAsync(groupId, cancellationToken);
    }

    /// <summary>
    /// <inheritdoc />
    /// </summary>
    protected override async Task<Guid> GetAreaIdForEntityAsync(Guid entityId, CancellationToken cancellationToken)
    {
        var group = await groupRepository.GetByIdAsync(entityId, cancellationToken);
        if (group == null)
            throw new InvalidOperationException("Группа не найдена");

        return group.AreaId;
    }

    /// <summary>
    /// <inheritdoc />
    /// </summary>
    protected override async Task EnsureAccessToEntityAsync(Guid entityId, CancellationToken cancellationToken)
    {
        var group = await groupRepository.GetByIdAsync(entityId, cancellationToken);
        if (group == null)
            throw new InvalidOperationException("Группа не найдена");

        if (!CurrentUser.HasAccessToArea(group.AreaId))
            throw new UnauthorizedAccessException("Доступ к группе запрещен");
    }

    /// <summary>
    /// <inheritdoc />
    /// </summary>
    protected override void AddLinkToContext(EventEntity createdEvent, Guid entityId, DateTimeOffset now)
    {
        var link = new EventToGroupEntity
        {
            EventId = createdEvent.Id,
            GroupId = entityId,
            OwnerUserId = CurrentUser.UserId,
            CreatedAt = now,
            UpdatedAt = now,
            IsActive = true
        };
        context.EventToGroups.Add(link);
    }

    /// <summary>
    /// <inheritdoc />
    /// </summary>
    protected override IQueryable<Guid> GetEventIdsForEntity(Guid entityId)
    {
        return context.EventToGroups
            .Where(l => l.GroupId == entityId && l.IsActive)
            .Select(l => l.EventId);
    }
}
