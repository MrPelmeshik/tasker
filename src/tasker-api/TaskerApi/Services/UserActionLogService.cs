using TaskerApi.Interfaces.Services;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Infrastructure;
using TaskerApi.Models.Entities;
using Microsoft.Extensions.Logging;

namespace TaskerApi.Services;

public class UserActionLogService : BaseService<UserActionLogEntity, Guid>, IUserActionLogService
{
    private readonly IUserActionLogProvider _userActionLogProvider;

    public UserActionLogService(ILogger logger, IUnitOfWorkFactory unitOfWorkFactory, IUserActionLogProvider userActionLogProvider) 
        : base(logger, unitOfWorkFactory, userActionLogProvider)
    {
        _userActionLogProvider = userActionLogProvider;
    }

    public async Task<IEnumerable<UserActionLogEntity>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<UserActionLogEntity>();
    }

    public async Task<IEnumerable<UserActionLogEntity>> GetByTimeRangeAsync(DateTimeOffset from, DateTimeOffset to, CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<UserActionLogEntity>();
    }

    public async Task<IEnumerable<UserActionLogEntity>> GetByActionAsync(string action, CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<UserActionLogEntity>();
    }

    public async Task LogActionAsync(Guid userId, string action, string? details = null, string? ipAddress = null, string? userAgent = null, CancellationToken cancellationToken = default)
    {
        var logEntry = new UserActionLogEntity
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Action = action,
            Details = details,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            Created = DateTimeOffset.UtcNow
        };

        await CreateAsync(logEntry, cancellationToken);
    }
}
