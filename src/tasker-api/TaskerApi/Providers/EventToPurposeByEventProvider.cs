using Microsoft.Extensions.Logging;
using TaskerApi.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

/// <summary>
/// Провайдер для связи событий с целями по событию
/// </summary>
public class EventToPurposeByEventProvider(
    ILogger<EventToPurposeByEventProvider> logger,
    TableMetaInfo<EventToPurposeByEventEntity> table,
    ICurrentUserService currentUserService)
    : BaseProvider<EventToPurposeByEventEntity, Guid>(logger, table, currentUserService), IEventToPurposeByEventProvider;
