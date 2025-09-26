using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class UserLogProvider(
    ILogger<UserLogProvider> logger, 
    TableMetaInfo<UserLogEntity> table,
    ICurrentUserService currentUserService) 
    : BaseProvider<UserLogEntity, int>(logger, table, currentUserService), IUserLogProvider;

