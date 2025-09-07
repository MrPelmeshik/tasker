using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class EventToTaskByTaskProvider(ILogger<EventToTaskByTaskProvider> logger, TableMetaInfo<EventToTaskByTaskEntity> table)
    : BaseProvider<EventToTaskByTaskEntity, Guid>(logger, table), IEventToTaskByTaskProvider;


