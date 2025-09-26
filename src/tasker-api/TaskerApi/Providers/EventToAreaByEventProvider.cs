using Microsoft.Extensions.Logging;
using TaskerApi.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

/// <summary>
/// Провайдер для связи событий с областями по событию
/// </summary>
public class EventToAreaByEventProvider(
    ILogger<EventToAreaByEventProvider> logger,
    TableMetaInfo<EventToAreaByEventEntity> table)
    : BaseProvider<EventToAreaByEventEntity, Guid>(logger, table), IEventToAreaByEventProvider;
