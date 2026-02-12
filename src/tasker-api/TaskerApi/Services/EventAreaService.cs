using TaskerApi.Core;
using TaskerApi.Interfaces.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Services.Base;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для работы с событиями областей
/// </summary>
public class EventAreaService(
    ILogger<EventAreaService> logger,
    ICurrentUserService currentUser,
    IEventRepository eventRepository,
    IAreaRepository areaRepository,
    TaskerDbContext context)
    : BaseService(logger, currentUser), IEventAreaService
{
    /// <inheritdoc />
    public async Task<EventCreateResponse> AddEventAsync(EventCreateEntityRequest item, CancellationToken cancellationToken)
    {
        var area = await areaRepository.GetByIdAsync(item.EntityId, cancellationToken);
        if (area == null)
            throw new InvalidOperationException("Область не найдена");

        if (!CurrentUser.HasAccessToArea(area.Id))
            throw new UnauthorizedAccessException("Доступ к области запрещен");

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

        var link = new EventToAreaEntity
        {
            EventId = createdEvent.Id,
            AreaId = item.EntityId,
            CreatorUserId = CurrentUser.UserId,
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
}
