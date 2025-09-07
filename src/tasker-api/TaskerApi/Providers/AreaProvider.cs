using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Providers.Interfaces;

namespace TaskerApi.Providers.Implementations;

public class AreaProvider(ILogger<AreaProvider> logger, TableMetaInfo<AreaEntity> table) 
    : BaseProvider<AreaEntity, Guid>(logger, table), IAreaProvider;

