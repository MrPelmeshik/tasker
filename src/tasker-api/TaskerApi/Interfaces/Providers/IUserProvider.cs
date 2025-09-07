using System.Data;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers.Interfaces;

public interface IUserProvider : IBaseProvider<UserEntity, Guid>
{
    Task<UserEntity?> GetByNameAsync(
        IDbConnection connection,
        string name,
        CancellationToken cancellationToken,
        IDbTransaction? transaction = null);

    Task<UserEntity?> GetByEmailAsync(
        IDbConnection connection,
        string email,
        CancellationToken cancellationToken,
        IDbTransaction? transaction = null);
}

