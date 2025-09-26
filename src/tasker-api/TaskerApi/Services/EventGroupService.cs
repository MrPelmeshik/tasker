using TaskerApi.Interfaces.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Requests.Base;

namespace TaskerApi.Services;

public class EventGroupService(
    ILogger<EventGroupService> logger, 
    IUnitOfWorkFactory uowFactory,
    IEventProvider eventProvider, 
    IEventToEntityBaseProvider<EventToGroupByEventEntity> eventToEntityByEntityProvider, 
    IEventToEntityBaseProvider<EventToGroupByEventEntity> eventToEntityByEventProvider, 
    ICurrentUserService currentUser) 
    : EventEntityBaseService<EventToGroupByEventEntity>(
        logger, 
        uowFactory,
        eventProvider, 
        eventToEntityByEntityProvider, 
        eventToEntityByEventProvider, 
        currentUser,
        EntityType.GROUP),
        IEventGroupService
{
    protected override EventToGroupByEventEntity GetEventToEntity(Guid eventId, EventCreateEntityRequest item)
    {
        return new EventToGroupByEventEntity()
        {
            Id = eventId,
            GroupId = item.EntityId,
            CreatorUserId = currentUser.UserId,
        };
    }
}
