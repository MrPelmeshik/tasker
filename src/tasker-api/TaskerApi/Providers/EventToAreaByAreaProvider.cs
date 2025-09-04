using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class EventToAreaByAreaProvider(TableMetaInfo<EventToAreaByAreaEntity> table) 
    : BaseProvider<EventToAreaByAreaEntity, Guid>(table), IEventToAreaByAreaProvider;