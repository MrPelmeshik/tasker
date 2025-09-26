using Microsoft.Extensions.Logging;
using TaskerApi.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

/// <summary>
/// Провайдер для связи событий с подзадачами по подзадаче
/// </summary>
public class EventToSubtaskBySubtaskProvider(
    ILogger<EventToSubtaskBySubtaskProvider> logger,
    TableMetaInfo<EventToSubtaskBySubtaskEntity> table)
    : BaseProvider<EventToSubtaskBySubtaskEntity, Guid>(logger, table),
        IEventToSubtaskBySubtaskProvider;
