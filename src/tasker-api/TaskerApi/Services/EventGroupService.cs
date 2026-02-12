using Microsoft.EntityFrameworkCore;
using TaskerApi.Core;
using TaskerApi.Interfaces.Core;
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
    TaskerDbContext context)
    : BaseService(logger, currentUser), IEventGroupService
{
    /// <inheritdoc />
    public async Task<EventCreateResponse> AddEventAsync(EventCreateEntityRequest item, CancellationToken cancellationToken)
    {
        var group = await groupRepository.GetByIdAsync(item.EntityId, cancellationToken);
        if (group == null)
            throw new InvalidOperationException("Группа не найдена");

        if (!CurrentUser.HasAccessToArea(group.AreaId))
            throw new UnauthorizedAccessException("Доступ к группе запрещен");

        var now = DateTimeOffset.UtcNow;

        var eventEntity = new EventEntity
        {
            Id = Guid.NewGuid(),
            Title = item.Title,
            Description = item.Description,
            EventType = item.EventType,
            CreatorUserId = CurrentUser.UserId,
            CreatedAt = now,
            UpdatedAt = now,
            IsActive = true
        };

        var createdEvent = await eventRepository.CreateAsync(eventEntity, cancellationToken);

        var link = new EventToGroupEntity
        {
            EventId = createdEvent.Id,
            GroupId = item.EntityId,
            CreatorUserId = CurrentUser.UserId,
            CreatedAt = now,
            UpdatedAt = now,
            IsActive = true
        };
        context.EventToGroups.Add(link);
        await context.SaveChangesAsync(cancellationToken);

        return new EventCreateResponse { Id = createdEvent.Id };
    }

    /// <inheritdoc />
    public Task<EventCreateResponse> AddEventAsync(IUnitOfWork uow, EventCreateEntityRequest item, CancellationToken cancellationToken)
    {
        return AddEventAsync(item, cancellationToken);
    }

    /// <inheritdoc />
    public Task<EventCreateResponse> AddEventCreateEntityAsync(IUnitOfWork uow, Guid entityId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException("Используйте AddEventAsync с EventCreateEntityRequest");
    }

    /// <inheritdoc />
    public Task<EventCreateResponse> AddEventUpdateEntityAsync(IUnitOfWork uow, Guid entityId, string changes, CancellationToken cancellationToken)
    {
        throw new NotImplementedException("Используйте AddEventAsync с EventCreateEntityRequest");
    }

    /// <inheritdoc />
    public Task<EventCreateResponse> AddEventDeleteEntityAsync(IUnitOfWork uow, Guid entityId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException("Используйте AddEventAsync с EventCreateEntityRequest");
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<EventResponse>> GetEventsByGroupIdAsync(Guid groupId, CancellationToken cancellationToken)
    {
        var group = await groupRepository.GetByIdAsync(groupId, cancellationToken);
        if (group == null)
            throw new InvalidOperationException("Группа не найдена");

        if (!CurrentUser.HasAccessToArea(group.AreaId))
            throw new UnauthorizedAccessException("Доступ к группе запрещен");

        var eventIds = context.EventToGroups
            .Where(l => l.GroupId == groupId && l.IsActive)
            .Select(l => l.EventId);
        var events = await context.Events
            .Where(e => eventIds.Contains(e.Id) && e.IsActive)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(cancellationToken);
        return events.Select(e => e.ToEventResponse()).ToList();
    }
}
