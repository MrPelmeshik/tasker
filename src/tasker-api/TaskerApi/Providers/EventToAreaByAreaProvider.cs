using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class EventToAreaByAreaProvider(ILogger<EventToAreaByAreaProvider> logger, TableMetaInfo<EventToAreaByAreaEntity> table) 
    : BaseProvider<EventToAreaByAreaEntity, Guid>(logger, table), IEventToAreaByAreaProvider;

