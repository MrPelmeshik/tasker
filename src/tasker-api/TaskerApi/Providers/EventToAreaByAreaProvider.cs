using Microsoft.Extensions.Logging;
using TaskerApi.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

/// <summary>
/// Провайдер для связи событий с областями по области
/// </summary>
public class EventToAreaByAreaProvider(
    ILogger<EventToAreaByAreaProvider> logger,
    TableMetaInfo<EventToAreaByAreaEntity> table,
    ICurrentUserService currentUserService)
    : BaseProvider<EventToAreaByAreaEntity, Guid>(logger, table, currentUserService), IEventToAreaByAreaProvider;
