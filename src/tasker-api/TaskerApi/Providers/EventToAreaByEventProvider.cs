using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Providers.Interfaces;

namespace TaskerApi.Providers.Implementations;

public class EventToAreaByEventProvider(ILogger<EventToAreaByEventProvider> logger, TableMetaInfo<EventToAreaByEventEntity> table) 
    : BaseProvider<EventToAreaByEventEntity, Guid>(logger, table), IEventToAreaByEventProvider;

