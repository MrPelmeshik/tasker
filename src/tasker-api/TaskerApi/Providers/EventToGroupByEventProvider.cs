using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Providers.Interfaces;

namespace TaskerApi.Providers.Implementations;

public class EventToGroupByEventProvider(ILogger<EventToGroupByEventProvider> logger, TableMetaInfo<EventToGroupByEventEntity> table) 
    : BaseProvider<EventToGroupByEventEntity, Guid>(logger, table), IEventToGroupByEventProvider;

