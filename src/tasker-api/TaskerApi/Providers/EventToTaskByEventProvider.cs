using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class EventToTaskByEventProvider(ILogger<EventToTaskByEventProvider> logger, TableMetaInfo<EventToTaskByEventEntity> table)
    : BaseProvider<EventToTaskByEventEntity, Guid>(logger, table), IEventToTaskByEventProvider;


