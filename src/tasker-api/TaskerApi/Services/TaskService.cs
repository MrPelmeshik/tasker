using Microsoft.Extensions.Logging;
using TaskerApi.Interfaces.Infrastructure;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;

namespace TaskerApi.Services;

/// <summary>
/// Сервис бизнес-логики для работы с задачами.
/// </summary>
public class TaskService(ITaskProvider provider, ILogger<TaskService> logger, IUnitOfWorkFactory uowFactory)
    : BaseService(logger, uowFactory), ITaskService
{
    /// <inheritdoc />
    public async Task<TaskEntity?> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        Logger.LogInformation($"Получение задачи {id}");
        return await ExecuteWithoutTransactionAsync(async connection => 
            await provider.GetByIdAsync(id, cancellationToken, connection), 
            cancellationToken);
    }

    /// <inheritdoc />
    public async Task<Guid> CreateAsync(TaskEntity entity, CancellationToken cancellationToken)
    {
        entity.Created = DateTimeOffset.UtcNow;
        entity.Updated = entity.Created;
        entity.IsActive = true;
        
        return await ExecuteInTransactionAsync(async uow => 
            await provider.InsertAsync(entity, cancellationToken, uow.Connection), 
            cancellationToken);
    }

    /// <inheritdoc />
    public async Task UpdateAsync(TaskEntity entity, CancellationToken cancellationToken)
    {
        entity.Updated = DateTimeOffset.UtcNow;
        
        await ExecuteInTransactionAsync(async uow => 
            await provider.UpdateAsync(entity, cancellationToken, uow.Connection), 
            cancellationToken);
    }
}


