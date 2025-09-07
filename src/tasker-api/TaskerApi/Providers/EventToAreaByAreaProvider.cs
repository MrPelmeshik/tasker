using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Providers.Interfaces;

namespace TaskerApi.Providers.Implementations;

public class EventToAreaByAreaProvider(ILogger<EventToAreaByAreaProvider> logger, TableMetaInfo<EventToAreaByAreaEntity> table) 
    : BaseProvider<EventToAreaByAreaEntity, Guid>(logger, table), IEventToAreaByAreaProvider;

