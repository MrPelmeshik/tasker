using System.Data;
using Dapper;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Common.SqlFilters;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

public class UserProvider(
    ILogger<UserProvider> logger, 
    TableMetaInfo<UserEntity> table) 
    : BaseProvider<UserEntity, Guid>(logger, table), IUserProvider
{
    public async Task<UserEntity?> GetByNameAsync(
        IDbConnection connection,
        string name,
        CancellationToken cancellationToken,
        IDbTransaction? transaction = null)
    {
        return await GetSimpleAsync(
            connection,
            cancellationToken,
            filers: [new StringFilter(nameof(UserEntity.Name), name)],
            orderColumn: nameof(UserEntity.Id),
            orderDesc: false,
            withDeleted: false,
            transaction: transaction
        );
    }

    public async Task<UserEntity?> GetByEmailAsync(
        IDbConnection connection,
        string email,
        CancellationToken cancellationToken,
        IDbTransaction? transaction = null)
    {
        return await GetSimpleAsync(
            connection,
            cancellationToken,
            filers: [new StringFilter(nameof(UserEntity.Email), email)],
            orderColumn: nameof(UserEntity.Id),
            orderDesc: false,
            withDeleted: false,
            transaction: transaction
        );
    }
}

