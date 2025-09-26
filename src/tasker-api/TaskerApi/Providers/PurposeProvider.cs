using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class PurposeProvider(
    ILogger<PurposeProvider> logger, 
    TableMetaInfo<PurposeEntity> table,
    ICurrentUserService currentUserService)
    : BaseProvider<PurposeEntity, Guid>(logger, table, currentUserService), IPurposeProvider;


