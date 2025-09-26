using Microsoft.Extensions.Logging;
using TaskerApi.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

/// <summary>
/// Провайдер для связи событий с целями по цели
/// </summary>
public class EventToPurposeByPurposeProvider(
    ILogger<EventToPurposeByPurposeProvider> logger,
    TableMetaInfo<EventToPurposeByPurposeEntity> table)
    : BaseProvider<EventToPurposeByPurposeEntity, Guid>(logger, table),
        IEventToPurposeByPurposeProvider;
