using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class EventToGroupByGroupProvider(ILogger<EventToGroupByGroupProvider> logger, TableMetaInfo<EventToGroupByGroupEntity> table)
    : BaseProvider<EventToGroupByGroupEntity, Guid>(logger, table), IEventToGroupByGroupProvider;


