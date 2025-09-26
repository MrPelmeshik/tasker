using Microsoft.Extensions.Logging;
using TaskerApi.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

/// <summary>
/// Провайдер для связи событий с задачами по событию
/// </summary>
public class EventToTaskByEventProvider(
    ILogger<EventToTaskByEventProvider> logger,
    TableMetaInfo<EventToTaskByEventEntity> table,
    ICurrentUserService currentUserService)
    : BaseProvider<EventToTaskByEventEntity, Guid>(logger, table, currentUserService), IEventToTaskByEventProvider;
