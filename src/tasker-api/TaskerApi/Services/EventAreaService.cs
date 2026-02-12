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
/// Сервис для работы с событиями областей
/// </summary>
public class EventAreaService(
    ILogger<EventAreaService> logger,
    ICurrentUserService currentUser,
    IEventRepository eventRepository,
    IAreaRepository areaRepository,
    IAreaRoleService areaRoleService,
    TaskerDbContext context)
    : BaseEventEntityService(logger, currentUser, eventRepository, areaRoleService, context), IEventAreaService
{
    /// <inheritdoc />
    public Task<EventCreateResponse> AddEventAsync(EventCreateEntityRequest item, CancellationToken cancellationToken)
        => AddEventCoreAsync(item, cancellationToken);

    /// <inheritdoc />
    public async Task<IReadOnlyList<EventResponse>> GetEventsByAreaIdAsync(Guid areaId, CancellationToken cancellationToken)
    {
        return await GetEventsCoreAsync(areaId, cancellationToken);
    }

    /// <summary>
    /// <inheritdoc />
    /// </summary>
    protected override async Task<Guid> GetAreaIdForEntityAsync(Guid entityId, CancellationToken cancellationToken)
    {
        var area = await areaRepository.GetByIdAsync(entityId, cancellationToken);
        if (area == null)
            throw new InvalidOperationException("Область не найдена");

        return area.Id;
    }

    /// <summary>
    /// <inheritdoc />
    /// </summary>
    protected override async Task EnsureAccessToEntityAsync(Guid entityId, CancellationToken cancellationToken)
    {
        var area = await areaRepository.GetByIdAsync(entityId, cancellationToken);
        if (area == null)
            throw new InvalidOperationException("Область не найдена");

        if (!CurrentUser.HasAccessToArea(area.Id))
            throw new UnauthorizedAccessException("Доступ к области запрещен");
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
