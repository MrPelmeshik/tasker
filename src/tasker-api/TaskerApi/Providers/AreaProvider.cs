using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class AreaProvider(
    ILogger<AreaProvider> logger, 
    TableMetaInfo<AreaEntity> table) 
    : BaseProvider<AreaEntity, Guid>(logger, table), IAreaProvider;

