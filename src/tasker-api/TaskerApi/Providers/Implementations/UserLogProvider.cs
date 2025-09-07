using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Providers.Interfaces;

namespace TaskerApi.Providers.Implementations;

public class UserLogProvider(ILogger<UserLogProvider> logger, TableMetaInfo<UserLogEntity> table) 
    : BaseProvider<UserLogEntity, int>(logger, table), IUserLogProvider;

