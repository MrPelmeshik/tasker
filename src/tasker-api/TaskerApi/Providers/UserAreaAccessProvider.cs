using System.Data;
using Dapper;
using TaskerApi.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Common.SqlFilters;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Entities.Contracts;

namespace TaskerApi.Providers;

/// <summary>
/// Провайдер для работы с правами доступа пользователей к областям
/// </summary>
public class UserAreaAccessProvider(
    ILogger<UserAreaAccessProvider> logger, 
    TableMetaInfo<UserAreaAccessEntity> table) 
    : BaseProvider<UserAreaAccessEntity, Guid>(logger, table), IUserAreaAccessProvider
{
    public async Task<IReadOnlyList<Guid>> GetUserAccessibleAreaIdsAsync(
        IDbConnection connection, 
        Guid userId, 
        CancellationToken cancellationToken, 
        IDbTransaction? transaction = null)
    {
        return (await GetListAsync(
            connection,
            cancellationToken,
            filers: [
                new SimpleFilter<Guid>(table[nameof(UserAreaAccessEntity.UserId)].DbName, userId)
            ],
            transaction: transaction
        ))
            .Select(x => x.AreaId)
            .ToArray()
            .AsReadOnly();
    }

    public async Task<Guid> GrantAccessAsync(
        IDbConnection connection, 
        Guid userId, 
        Guid areaId, 
        Guid grantedByUserId, 
        CancellationToken cancellationToken, 
        IDbTransaction? transaction = null)
    {
        return await CreateAsync(
            connection, 
            new UserAreaAccessEntity
            {
                UserId = userId,
                AreaId = areaId,
                GrantedByUserId = grantedByUserId,
            }, 
            cancellationToken, 
            transaction, 
            setDefaultValues: true);
    }

    public async Task<int> RevokeAccessAsync(
        IDbConnection connection, 
        Guid userId, 
        Guid areaId, 
        CancellationToken cancellationToken, 
        IDbTransaction? transaction = null)
    {
        return await UpdateAsync(
            connection,
            new UserAreaAccessEntity
            {
                IsActive = false,
                DeactivatedAt = DateTime.UtcNow
            },
            cancellationToken,
            filers: [
                new SimpleFilter<Guid>(nameof(UserAreaAccessEntity.UserId), userId), 
                new SimpleFilter<Guid>(nameof(UserAreaAccessEntity.AreaId), areaId)
            ],
            transaction,
            setDefaultValues: true);
    }
}
