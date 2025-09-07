using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class TaskProvider(ILogger<TaskProvider> logger, TableMetaInfo<TaskEntity> table)
    : BaseProvider<TaskEntity, Guid>(logger, table), ITaskProvider;


