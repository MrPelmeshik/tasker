using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class EventToPurposeByPurposeProvider(ILogger<EventToPurposeByPurposeProvider> logger, TableMetaInfo<EventToPurposeByPurposeEntity> table)
    : BaseProvider<EventToPurposeByPurposeEntity, Guid>(logger, table), IEventToPurposeByPurposeProvider;


