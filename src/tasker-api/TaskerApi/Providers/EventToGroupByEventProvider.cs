using Microsoft.Extensions.Logging;
using TaskerApi.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

/// <summary>
/// Провайдер для связи событий с группами по событию
/// </summary>
public class EventToGroupByEventProvider(
    ILogger<EventToGroupByEventProvider> logger,
    TableMetaInfo<EventToGroupByEventEntity> table)
    : BaseProvider<EventToGroupByEventEntity, Guid>(logger, table), IEventToGroupByEventProvider;
