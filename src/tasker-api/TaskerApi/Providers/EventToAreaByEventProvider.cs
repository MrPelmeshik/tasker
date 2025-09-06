using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class EventToAreaByEventProvider(ILogger<EventToAreaByEventProvider> logger, TableMetaInfo<EventToAreaByEventEntity> table) 
    : BaseProvider<EventToAreaByEventEntity, Guid>(logger, table), IEventToAreaByEventProvider;