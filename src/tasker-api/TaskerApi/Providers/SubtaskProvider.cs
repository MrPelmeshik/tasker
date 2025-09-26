using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class SubtaskProvider(
    ILogger<SubtaskProvider> logger, 
    TableMetaInfo<SubtaskEntity> table)
    : BaseProvider<SubtaskEntity, Guid>(logger, table), ISubtaskProvider;


