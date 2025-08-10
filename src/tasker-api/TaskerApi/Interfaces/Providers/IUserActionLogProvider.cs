using System.Data;
using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Providers;

public interface IUserActionLogProvider : ICrudProvider<UserActionLogEntity, Guid>
{
    Task<IEnumerable<UserActionLogEntity>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserActionLogEntity>> GetByTimeRangeAsync(DateTimeOffset from, DateTimeOffset to, CancellationToken cancellationToken = default);
    Task<IEnumerable<UserActionLogEntity>> GetByActionAsync(string action, CancellationToken cancellationToken = default);
}


