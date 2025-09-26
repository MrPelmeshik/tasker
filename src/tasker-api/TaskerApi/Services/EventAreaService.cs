using TaskerApi.Interfaces.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Services.Base;

namespace TaskerApi.Services;

public class EventAreaService(
    ILogger<EventAreaService> logger, 
    IUnitOfWorkFactory uowFactory,
    IEventProvider eventProvider, 
    IEventToEntityBaseProvider<EventToAreaByEventEntity> eventToEntityByEntityProvider, 
    IEventToEntityBaseProvider<EventToAreaByEventEntity> eventToEntityByEventProvider, 
    ICurrentUserService currentUser) 
    : EventEntityBaseService<EventToAreaByEventEntity>(
        logger, 
        uowFactory,
        eventProvider, 
        eventToEntityByEntityProvider, 
        eventToEntityByEventProvider, 
        currentUser,
        EntityType.AREA),
        IEventAreaService
{
    protected override EventToAreaByEventEntity GetEventToEntity(Guid eventId, EventCreateEntityRequest item)
    {
        return new EventToAreaByEventEntity()
        {
            Id = eventId,
            AreaId = item.EntityId,
            CreatorUserId = currentUser.UserId,
        };
    }
}
