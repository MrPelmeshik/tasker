using Microsoft.Extensions.Logging;
using TaskerApi.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

/// <summary>
/// Провайдер для связи событий с подзадачами по событию
/// </summary>
public class EventToSubtaskByEventProvider(
    ILogger<EventToSubtaskByEventProvider> logger,
    TableMetaInfo<EventToSubtaskByEventEntity> table,
    ICurrentUserService currentUserService)
    : BaseProvider<EventToSubtaskByEventEntity, Guid>(logger, table, currentUserService), IEventToSubtaskByEventProvider;
