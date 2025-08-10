using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

public interface IUserActionLogService : ICrudService<UserActionLogEntity, Guid>
{
    Task<IEnumerable<UserActionLogEntity>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserActionLogEntity>> GetByTimeRangeAsync(DateTimeOffset from, DateTimeOffset to, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserActionLogEntity>> GetByActionAsync(string action, CancellationToken cancellationToken = default);
    Task LogActionAsync(Guid userId, string action, string? details = null, string? ipAddress = null, string? userAgent = null, CancellationToken cancellationToken = default);
}
