using Microsoft.Extensions.Logging;
using TaskerApi.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

/// <summary>
/// Провайдер для связи событий с областями по области
/// </summary>
public class EventToAreaByAreaProvider(
    ILogger<EventToAreaByAreaProvider> logger,
    TableMetaInfo<EventToAreaByAreaEntity> table)
    : BaseProvider<EventToAreaByAreaEntity, Guid>(logger, table), IEventToAreaByAreaProvider;
