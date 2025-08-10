using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Providers;

public interface IActionProvider : ICrudProvider<ActionEntity, Guid>
{
    Task<IEnumerable<ActionEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ActionEntity>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ActionEntity>> GetByTimeRangeAsync(DateTimeOffset from, DateTimeOffset to, CancellationToken cancellationToken = default);
    Task<IEnumerable<ActionEntity>> GetActiveAsync(CancellationToken cancellationToken = default);
}
