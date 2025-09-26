using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class EventProvider(
    ILogger<EventProvider> logger, 
    TableMetaInfo<EventEntity> table,
    ICurrentUserService currentUserService) 
    : BaseProvider<EventEntity, Guid>(logger, table, currentUserService), IEventProvider;

