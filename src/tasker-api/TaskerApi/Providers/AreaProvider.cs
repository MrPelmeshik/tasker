using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class AreaProvider(
    ILogger<AreaProvider> logger, 
    TableMetaInfo<AreaEntity> table, 
    ICurrentUserService currentUserService) 
    : BaseProvider<AreaEntity, Guid>(logger, table, currentUserService), IAreaProvider;

