using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class UserLogProvider(TableMetaInfo<UserLogEntity> table) 
    : BaseProvider<UserLogEntity, int>(table), IUserLogProvider;