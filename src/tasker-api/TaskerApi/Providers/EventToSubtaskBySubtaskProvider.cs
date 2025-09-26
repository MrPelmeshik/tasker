using Microsoft.Extensions.Logging;
using TaskerApi.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

/// <summary>
/// Провайдер для связи событий с подзадачами по подзадаче
/// </summary>
public class EventToSubtaskBySubtaskProvider(
    ILogger<EventToSubtaskBySubtaskProvider> logger,
    TableMetaInfo<EventToSubtaskBySubtaskEntity> table,
    ICurrentUserService currentUserService)
    : BaseProvider<EventToSubtaskBySubtaskEntity, Guid>(logger, table, currentUserService),
        IEventToSubtaskBySubtaskProvider;
