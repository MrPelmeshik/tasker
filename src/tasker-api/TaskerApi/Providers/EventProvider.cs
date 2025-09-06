using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class EventProvider(ILogger<EventProvider> logger, TableMetaInfo<EventEntity> table) 
    : BaseProvider<EventEntity, Guid>(logger, table), IEventProvider;