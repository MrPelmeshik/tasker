using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class EventProvider(TableMetaInfo<EventEntity> table) 
    : BaseProvider<EventEntity, Guid>(table), IEventProvider;