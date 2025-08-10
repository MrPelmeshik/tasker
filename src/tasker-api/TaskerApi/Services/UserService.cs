using Microsoft.Extensions.Logging;
using TaskerApi.Interfaces.Infrastructure;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;

namespace TaskerApi.Services;

/// <summary>
/// Сервис бизнес-логики для работы с пользователями.
/// </summary>
public class UserService(IUserProvider provider, ILogger<UserService> logger, IUnitOfWorkFactory uowFactory)
    : BaseService(logger, uowFactory), IUserService
{
    /// <inheritdoc />
    public async Task<IEnumerable<UserEntity>> GetAllAsync(CancellationToken cancellationToken)
    {
        Logger.LogInformation("Получение всех пользователей");
        return await ExecuteWithoutTransactionAsync(async connection => 
            await provider.GetAllAsync(cancellationToken, connection), 
            cancellationToken);
    }

    /// <inheritdoc />
    public async Task<UserEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        Logger.LogInformation($"Получение пользователя {id}");
        return await ExecuteWithoutTransactionAsync(async connection => 
            await provider.GetByIdAsync(id, cancellationToken, connection), 
            cancellationToken);
    }

    /// <inheritdoc />
    public async Task<UserEntity?> GetDetailedAsync(Guid id, CancellationToken cancellationToken)
    {
        Logger.LogInformation($"Получение детальной информации о пользователе {id}");
        return await ExecuteWithoutTransactionAsync(async connection => 
            await provider.GetByIdAsync(id, cancellationToken, connection), 
            cancellationToken);
    }

    /// <inheritdoc />
    public async Task<Guid> CreateAsync(UserEntity user, CancellationToken cancellationToken)
    {
        user.Created = DateTimeOffset.UtcNow;
        user.Updated = user.Created;
        user.IsActive = true;
        
        return await ExecuteInTransactionAsync(async uow => 
            await provider.InsertAsync(user, cancellationToken, uow.Connection), 
            cancellationToken);
    }

    /// <inheritdoc />
    public async Task UpdateAsync(UserEntity user, CancellationToken cancellationToken)
    {
        user.Updated = DateTimeOffset.UtcNow;
        
        await ExecuteInTransactionAsync(async uow => 
            await provider.UpdateAsync(user, cancellationToken, uow.Connection), 
            cancellationToken);
    }

    /// <inheritdoc />
    public async Task DeactivateAsync(Guid id, CancellationToken cancellationToken)
    {
        Logger.LogInformation($"Деактивация пользователя {id}");
        var user = await GetByIdAsync(id, cancellationToken);
        if (user != null)
        {
            user.IsActive = false;
            user.Deactivated = DateTimeOffset.UtcNow;
            user.Updated = DateTimeOffset.UtcNow;
            
            await ExecuteInTransactionAsync(async uow => 
                await provider.UpdateAsync(user, cancellationToken, uow.Connection), 
                cancellationToken);
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<UserEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken)
    {
        Logger.LogInformation($"Получение пользователей по области {areaId}");
        return await ExecuteWithoutTransactionAsync(async connection => 
            await provider.GetByAreaAsync(areaId, cancellationToken, connection), 
            cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<UserEntity>> GetActiveAsync(CancellationToken cancellationToken)
    {
        Logger.LogInformation("Получение активных пользователей");
        return await ExecuteWithoutTransactionAsync(async connection => 
            await provider.GetActiveAsync(cancellationToken, connection), 
            cancellationToken);
    }
}
