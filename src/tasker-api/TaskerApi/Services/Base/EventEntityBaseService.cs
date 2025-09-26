using TaskerApi.Interfaces.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Entities.Base;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Requests.Base;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services;

public abstract class EventEntityBaseService<TEventToEntity>(
    ILogger<EventEntityBaseService<TEventToEntity>> logger,
    IUnitOfWorkFactory uowFactory,
    IEventProvider eventProvider,
    IEventToEntityBaseProvider<TEventToEntity> eventToEntityByEntityProvider,
    IEventToEntityBaseProvider<TEventToEntity> eventToEntityByEventProvider,
    ICurrentUserService currentUser,
    EntityType entityType)
    : IEventEntityService
    where TEventToEntity : EventRelationBaseEntity
{
    private EntityType EntityType { get; } = entityType;

    protected abstract TEventToEntity GetEventToEntity(Guid eventId, EventCreateEntityRequest item);

    public async Task<EventCreateResponse> AddEventCreateEntityAsync(IUnitOfWork uow, Guid entityId,
        CancellationToken cancellationToken)
    {
        return await AddEventAsync(
            uow,
            new EventCreateEntityRequest
            {
                EntityId = entityId,
                EventType = EventType.CREATE,
                Title = $"Создан элемент {EntityType}",
            },
            cancellationToken);
    }

    public async Task<EventCreateResponse> AddEventUpdateEntityAsync(IUnitOfWork uow, Guid entityId, string changes, CancellationToken cancellationToken)
    {
        return await AddEventAsync(
            uow,
            new EventCreateEntityRequest
            {
                EntityId = entityId,
                EventType = EventType.UPDATE,
                Title = $"Обновлен элемент {EntityType}",
                Description = changes,
            },
            cancellationToken);
    }

    public async Task<EventCreateResponse> AddEventDeleteEntityAsync(IUnitOfWork uow, Guid entityId, CancellationToken cancellationToken)
    {
        return await AddEventAsync(
            uow, 
            new EventCreateEntityRequest
            {
                EntityId = entityId,
                EventType = EventType.DELETE,
                Title = $"Удален элемент {EntityType}",
            }, 
            cancellationToken);
    }

    public async Task<EventCreateResponse> AddEventAsync(
        IUnitOfWork uow, 
        EventCreateEntityRequest item,
        CancellationToken cancellationToken)
    {
        var eventId = await eventProvider.CreateAsync(
            uow.Connection,
            new EventEntity
            {
                Type = item.EventType,
                Title = item.Title,
                Description = item.Description,
                CreatorUserId = currentUser.UserId,
            },
            cancellationToken,
            uow.Transaction,
            true);

        await eventToEntityByEventProvider.CreateAsync(
            uow.Connection,
            GetEventToEntity(eventId, item),
            cancellationToken,
            uow.Transaction,
            true);

        await uow.CommitAsync(cancellationToken);
        logger.LogInformation("Event created");
        return new EventCreateResponse
        {
            Id = eventId,
        };
    }

    public async Task<EventCreateResponse> AddEventAsync(
        EventCreateEntityRequest item,
        CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);
        
        try
        {
            var response = await AddEventAsync(uow, item, cancellationToken);
            await uow.CommitAsync(cancellationToken);
            return response;
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }
}