using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class UserLogProvider(ILogger<UserLogProvider> logger, TableMetaInfo<UserLogEntity> table) 
    : BaseProvider<UserLogEntity, int>(logger, table), IUserLogProvider;