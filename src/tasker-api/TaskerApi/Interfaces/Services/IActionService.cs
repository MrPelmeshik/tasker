using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

public interface IActionService : ICrudService<ActionEntity, Guid>
{
    Task<IEnumerable<ActionEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ActionEntity>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ActionEntity>> GetByTimeRangeAsync(DateTimeOffset from, DateTimeOffset to, CancellationToken cancellationToken = default);
    Task<IEnumerable<ActionEntity>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task StartActionAsync(Guid areaId, Guid userId, int? verbId, string? summary, string? note, int visibilityId, CancellationToken cancellationToken = default);
    Task FinishActionAsync(Guid actionId, CancellationToken cancellationToken = default);
    Task UpdateActionAsync(Guid actionId, string? summary, string? note, int? verbId, int? visibilityId, CancellationToken cancellationToken = default);
}
