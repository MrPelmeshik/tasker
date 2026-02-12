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
/// Сервис для работы с событиями областей
/// </summary>
public class EventAreaService(
    ILogger<EventAreaService> logger,
    ICurrentUserService currentUser,
    IEventRepository eventRepository,
    IAreaRepository areaRepository,
    IAreaRoleService areaRoleService,
    TaskerDbContext context)
    : BaseService(logger, currentUser), IEventAreaService
{
    /// <inheritdoc />
    public async Task<EventCreateResponse> AddEventAsync(EventCreateEntityRequest item, CancellationToken cancellationToken)
    {
        var area = await areaRepository.GetByIdAsync(item.EntityId, cancellationToken);
        if (area == null)
            throw new InvalidOperationException("Область не найдена");

        if (!await areaRoleService.CanAddActivityAsync(area.Id, cancellationToken))
            throw new UnauthorizedAccessException("Нет прав на добавление записей по активности в область");

        var now = DateTimeOffset.UtcNow;

        var messageJson = EventMessageHelper.BuildActivityMessageJson(item.Title, item.Description);

        var eventEntity = new EventEntity
        {
            Id = Guid.NewGuid(),
            Title = item.Title,
            Message = messageJson,
            EventType = item.EventType,
            OwnerUserId = CurrentUser.UserId,
            CreatedAt = now,
            UpdatedAt = now,
            IsActive = true
        };

        var createdEvent = await eventRepository.CreateAsync(eventEntity, cancellationToken);

        var link = new EventToAreaEntity
        {
            EventId = createdEvent.Id,
            AreaId = item.EntityId,
            OwnerUserId = CurrentUser.UserId,
            CreatedAt = now,
            UpdatedAt = now,
            IsActive = true
        };
        context.EventToAreas.Add(link);
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
    public async Task<IReadOnlyList<EventResponse>> GetEventsByAreaIdAsync(Guid areaId, CancellationToken cancellationToken)
    {
        var area = await areaRepository.GetByIdAsync(areaId, cancellationToken);
        if (area == null)
            throw new InvalidOperationException("Область не найдена");

        if (!CurrentUser.HasAccessToArea(area.Id))
            throw new UnauthorizedAccessException("Доступ к области запрещен");

        var eventIds = context.EventToAreas
            .Where(l => l.AreaId == areaId && l.IsActive)
            .Select(l => l.EventId);
        var events = await context.Events
            .Where(e => eventIds.Contains(e.Id) && e.IsActive)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(cancellationToken);
        return events.Select(e => e.ToEventResponse()).ToList();
    }
}
