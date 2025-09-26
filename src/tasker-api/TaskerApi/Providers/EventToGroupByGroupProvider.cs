using Microsoft.Extensions.Logging;
using TaskerApi.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

/// <summary>
/// Провайдер для связи событий с группами по группе
/// </summary>
public class EventToGroupByGroupProvider(
    ILogger<EventToGroupByGroupProvider> logger,
    TableMetaInfo<EventToGroupByGroupEntity> table)
    : BaseProvider<EventToGroupByGroupEntity, Guid>(logger, table), IEventToGroupByGroupProvider;
