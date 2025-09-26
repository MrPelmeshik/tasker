using TaskerApi.Interfaces.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Requests.Base;

namespace TaskerApi.Services;

public class EventTaskService(
    ILogger<EventTaskService> logger, 
    IUnitOfWorkFactory uowFactory,
    IEventProvider eventProvider, 
    IEventToEntityBaseProvider<EventToTaskByEventEntity> eventToEntityByEntityProvider, 
    IEventToEntityBaseProvider<EventToTaskByEventEntity> eventToEntityByEventProvider, 
    ICurrentUserService currentUser) 
    : EventEntityBaseService<EventToTaskByEventEntity>(
        logger, 
        uowFactory,
        eventProvider, 
        eventToEntityByEntityProvider, 
        eventToEntityByEventProvider, 
        currentUser,
        EntityType.TASK),
        IEventTaskService
{
    protected override EventToTaskByEventEntity GetEventToEntity(Guid eventId, EventCreateEntityRequest item)
    {
        return new EventToTaskByEventEntity()
        {
            Id = eventId,
            TaskId = item.EntityId,
        };
    }
}