using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class EventToGroupByEventProvider(ILogger<EventToGroupByEventProvider> logger, TableMetaInfo<EventToGroupByEventEntity> table) 
    : BaseProvider<EventToGroupByEventEntity, Guid>(logger, table), IEventToGroupByEventProvider;

