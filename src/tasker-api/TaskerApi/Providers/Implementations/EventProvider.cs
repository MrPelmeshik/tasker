using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Providers.Interfaces;

namespace TaskerApi.Providers.Implementations;

public class EventProvider(ILogger<EventProvider> logger, TableMetaInfo<EventEntity> table) 
    : BaseProvider<EventEntity, Guid>(logger, table), IEventProvider;

