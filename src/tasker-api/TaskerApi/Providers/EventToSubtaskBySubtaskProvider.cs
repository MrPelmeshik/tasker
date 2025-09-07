using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class EventToSubtaskBySubtaskProvider(ILogger<EventToSubtaskBySubtaskProvider> logger, TableMetaInfo<EventToSubtaskBySubtaskEntity> table)
    : BaseProvider<EventToSubtaskBySubtaskEntity, Guid>(logger, table), IEventToSubtaskBySubtaskProvider;


