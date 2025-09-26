using Microsoft.Extensions.Logging;
using TaskerApi.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

/// <summary>
/// Провайдер для связи событий с задачами по задаче
/// </summary>
public class EventToTaskByTaskProvider(
    ILogger<EventToTaskByTaskProvider> logger,
    TableMetaInfo<EventToTaskByTaskEntity> table,
    ICurrentUserService currentUserService)
    : BaseProvider<EventToTaskByTaskEntity, Guid>(logger, table, currentUserService), IEventToTaskByTaskProvider;
