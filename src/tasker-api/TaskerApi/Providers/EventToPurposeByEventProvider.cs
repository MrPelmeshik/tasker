using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class EventToPurposeByEventProvider(ILogger<EventToPurposeByEventProvider> logger, TableMetaInfo<EventToPurposeByEventEntity> table)
    : BaseProvider<EventToPurposeByEventEntity, Guid>(logger, table), IEventToPurposeByEventProvider;


