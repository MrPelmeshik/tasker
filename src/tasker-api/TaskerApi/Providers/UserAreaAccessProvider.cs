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
    public async Task<bool> HasAccessAsync(
        IDbConnection connection, 
        Guid userId, 
        Guid areaId, 
        CancellationToken cancellationToken, 
        IDbTransaction? transaction = null)
    {
        var sql = $"""
                   SELECT COUNT(1) 
                   FROM {table.DbName} 
                   WHERE {table[nameof(UserAreaAccessEntity.UserId)].DbName} = @userId 
                     AND {table[nameof(UserAreaAccessEntity.AreaId)].DbName} = @areaId 
                     AND {table[nameof(ISoftDeleteBaseEntity.IsActive)].DbName} = true
                   """;

        var count = await connection.QueryFirstAsync<int>(new CommandDefinition(
            commandText: sql,
            parameters: new { userId, areaId },
            transaction: transaction,
            cancellationToken: cancellationToken));

        return count > 0;
    }

    public async Task<IReadOnlyList<Guid>> GetUserAccessibleAreaIdsAsync(
        IDbConnection connection, 
        Guid userId, 
        CancellationToken cancellationToken, 
        IDbTransaction? transaction = null)
    {
        var sql = $"""
                   SELECT {table[nameof(UserAreaAccessEntity.AreaId)].DbName} 
                   FROM {table.DbName} 
                   WHERE {table[nameof(UserAreaAccessEntity.UserId)].DbName} = @userId 
                     AND {table[nameof(ISoftDeleteBaseEntity.IsActive)].DbName} = true
                   """;

        var areaIds = await connection.QueryAsync<Guid>(new CommandDefinition(
            commandText: sql,
            parameters: new { userId },
            transaction: transaction,
            cancellationToken: cancellationToken));

        return areaIds.ToList();
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
        var sql = $"""
                   UPDATE {table.DbName} 
                   SET {table[nameof(ISoftDeleteBaseEntity.IsActive)].DbName} = false,
                       {table[nameof(ISoftDeleteBaseEntity.DeactivatedAt)].DbName} = now(),
                       {table[nameof(IUpdatedDateBaseEntity.UpdatedAt)].DbName} = now()
                   WHERE {table[nameof(UserAreaAccessEntity.UserId)].DbName} = @userId 
                     AND {table[nameof(UserAreaAccessEntity.AreaId)].DbName} = @areaId 
                     AND {table[nameof(ISoftDeleteBaseEntity.IsActive)].DbName} = true
                   """;

        var affected = await connection.ExecuteAsync(new CommandDefinition(
            commandText: sql,
            parameters: new { userId, areaId },
            transaction: transaction,
            cancellationToken: cancellationToken));

        return affected;
    }
}
