using Microsoft.Extensions.Logging;
using TaskerApi.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

/// <summary>
/// Провайдер для связи событий с задачами по событию
/// </summary>
public class EventToTaskByEventProvider(
    ILogger<EventToTaskByEventProvider> logger,
    TableMetaInfo<EventToTaskByEventEntity> table)
    : BaseProvider<EventToTaskByEventEntity, Guid>(logger, table), IEventToTaskByEventProvider;
