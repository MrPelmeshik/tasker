using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class EventToAreaByEventProvider(TableMetaInfo<EventToAreaByEventEntity> table) 
    : BaseProvider<EventToAreaByEventEntity, Guid>(table), IEventToAreaByEventProvider;