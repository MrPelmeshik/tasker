using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class TaskProvider(
    ILogger<TaskProvider> logger, 
    TableMetaInfo<TaskEntity> table,
    ICurrentUserService currentUserService)
    : BaseProvider<TaskEntity, Guid>(logger, table, currentUserService), ITaskProvider;


