using System.Data;
using Dapper;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class UserProvider(ILogger<UserProvider> logger, TableMetaInfo<UserEntity> table) 
    : BaseProvider<UserEntity, Guid>(logger, table), IUserProvider
{
    public async Task<UserEntity?> GetByNameAsync(
        IDbConnection connection,
        string name,
        CancellationToken cancellationToken,
        IDbTransaction? transaction = null)
    {
        var sql = $"""
                   SELECT {string.Join(", ", table.ColumnInfos.Select(c => $"{c.DbName} as {c.SrcName}"))}
                   FROM {table.DbName}
                   WHERE lower({table[nameof(UserEntity.Name)].DbName}) = lower(@{nameof(name)})
                   LIMIT 1
                   """;

        var user = await connection.QueryFirstOrDefaultAsync<UserEntity>(new CommandDefinition(
            commandText: sql,
            parameters: new { name },
            transaction: transaction,
            cancellationToken: cancellationToken));
        return user;
    }

    public async Task<UserEntity?> GetByEmailAsync(
        IDbConnection connection,
        string email,
        CancellationToken cancellationToken,
        IDbTransaction? transaction = null)
    {
        var sql = $"""
                   SELECT {string.Join(", ", table.ColumnInfos.Select(c => $"{c.DbName} as {c.SrcName}"))}
                   FROM {table.DbName}
                   WHERE lower({table[nameof(UserEntity.Email)].DbName}) = lower(@{nameof(email)})
                   LIMIT 1
                   """;

        var user = await connection.QueryFirstOrDefaultAsync<UserEntity>(new CommandDefinition(
            commandText: sql,
            parameters: new { email },
            transaction: transaction,
            cancellationToken: cancellationToken));
        return user;
    }
}

