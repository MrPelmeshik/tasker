using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class SubtaskProvider(
    ILogger<SubtaskProvider> logger, 
    TableMetaInfo<SubtaskEntity> table,
    ICurrentUserService currentUserService)
    : BaseProvider<SubtaskEntity, Guid>(logger, table, currentUserService), ISubtaskProvider;


