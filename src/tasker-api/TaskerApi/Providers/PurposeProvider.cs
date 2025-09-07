using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class PurposeProvider(ILogger<PurposeProvider> logger, TableMetaInfo<PurposeEntity> table)
    : BaseProvider<PurposeEntity, Guid>(logger, table), IPurposeProvider;


