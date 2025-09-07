using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class EventToSubtaskByEventProvider(ILogger<EventToSubtaskByEventProvider> logger, TableMetaInfo<EventToSubtaskByEventEntity> table)
    : BaseProvider<EventToSubtaskByEventEntity, Guid>(logger, table), IEventToSubtaskByEventProvider;


