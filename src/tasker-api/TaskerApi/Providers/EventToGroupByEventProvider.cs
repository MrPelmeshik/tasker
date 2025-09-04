using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class EventToGroupByEventProvider(TableMetaInfo<EventToGroupByEventEntity> table) 
    : BaseProvider<EventToGroupByEventEntity, Guid>(table), IEventToGroupByEventProvider;