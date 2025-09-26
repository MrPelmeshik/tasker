using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class GroupProvider(
    ILogger<GroupProvider> logger, 
    TableMetaInfo<GroupEntity> table)
    : BaseProvider<GroupEntity, Guid>(logger, table), IGroupProvider;


