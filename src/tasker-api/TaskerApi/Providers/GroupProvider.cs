using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class GroupProvider(
    ILogger<GroupProvider> logger, 
    TableMetaInfo<GroupEntity> table,
    ICurrentUserService currentUserService)
    : BaseProvider<GroupEntity, Guid>(logger, table, currentUserService), IGroupProvider;


