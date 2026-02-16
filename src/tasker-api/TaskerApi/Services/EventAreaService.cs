using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Services.Base;
using TaskerApi.Constants;
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
    IRealtimeNotifier realtimeNotifier,
    TaskerDbContext context)
    : BaseEventEntityService(logger, currentUser, eventRepository, areaRoleService, context), IEventAreaService
{
    /// <inheritdoc />
    public async Task<EventCreateResponse> AddEventAsync(EventCreateEntityRequest item, CancellationToken cancellationToken)
    {
        var result = await AddEventCoreAsync(item, cancellationToken);
        await realtimeNotifier.NotifyEntityChangedAsync(Models.Common.EntityType.EVENT, item.EntityId, item.EntityId, null, RealtimeEventType.Create, cancellationToken);
        return result;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<EventResponse>> GetEventsByAreaIdAsync(Guid areaId, CancellationToken cancellationToken)
    {
        return await GetEventsCoreAsync(areaId, cancellationToken);
    }

    /// <inheritdoc />
    public async Task UpdateEventAsync(Guid eventId, EventUpdateEntityRequest request, CancellationToken cancellationToken)
    {
        await UpdateEventCoreAsync(eventId, request, cancellationToken);
        var (areaId, entityId, folderId) = await GetEventRealtimeContextAsync(eventId, cancellationToken);
        await realtimeNotifier.NotifyEntityChangedAsync(Models.Common.EntityType.EVENT, entityId, areaId, folderId, RealtimeEventType.Update, cancellationToken);
    }

    /// <inheritdoc />
    public async Task DeleteEventAsync(Guid eventId, CancellationToken cancellationToken)
    {
        var (areaId, entityId, folderId) = await GetEventRealtimeContextAsync(eventId, cancellationToken);
        await DeleteEventCoreAsync(eventId, cancellationToken);
        await realtimeNotifier.NotifyEntityChangedAsync(Models.Common.EntityType.EVENT, entityId, areaId, folderId, RealtimeEventType.Delete, cancellationToken);
    }

    /// <summary>
    /// <inheritdoc />
    /// </summary>
    protected override async Task<Guid> GetAreaIdForEntityAsync(Guid entityId, CancellationToken cancellationToken)
    {
        var area = await areaRepository.GetByIdAsync(entityId, cancellationToken);
        if (area == null)
            throw new InvalidOperationException(ErrorMessages.AreaNotFound);

        return area.Id;
    }

    /// <summary>
    /// <inheritdoc />
    /// </summary>
    protected override async Task EnsureAccessToEntityAsync(Guid entityId, CancellationToken cancellationToken)
    {
        var area = await areaRepository.GetByIdAsync(entityId, cancellationToken);
        if (area == null)
            throw new InvalidOperationException(ErrorMessages.AreaNotFound);

        if (!CurrentUser.HasAccessToArea(area.Id))
            throw new UnauthorizedAccessException(ErrorMessages.AccessAreaDenied);
    }

    /// <summary>
    /// <inheritdoc />
    /// </summary>
    protected override void AddLinkToContext(EventEntity createdEvent, Guid entityId, DateTimeOffset now)
    {
        var link = new EventToAreaEntity
        {
            EventId = createdEvent.Id,
            AreaId = entityId,
            OwnerUserId = CurrentUser.UserId,
            CreatedAt = now,
            UpdatedAt = now,
            IsActive = true
        };
        context.EventToAreas.Add(link);
    }

    /// <summary>
    /// <inheritdoc />
    /// </summary>
    protected override IQueryable<Guid> GetEventIdsForEntity(Guid entityId)
    {
        return context.EventToAreas
            .Where(l => l.AreaId == entityId && l.IsActive)
            .Select(l => l.EventId);
    }
}
