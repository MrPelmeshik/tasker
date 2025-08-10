using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

public interface IRuleService : ICrudService<RuleEntity, Guid>
{
    Task<IEnumerable<RuleEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default);
    Task<IEnumerable<RuleEntity>> GetEnabledAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<RuleEntity>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task EnableAsync(Guid id, CancellationToken cancellationToken = default);
    Task DisableAsync(Guid id, CancellationToken cancellationToken = default);
}
