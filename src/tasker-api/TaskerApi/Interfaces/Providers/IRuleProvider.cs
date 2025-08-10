using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Providers;

public interface IRuleProvider : ICrudProvider<RuleEntity, Guid>
{
    Task<IEnumerable<RuleEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default);
    Task<IEnumerable<RuleEntity>> GetEnabledAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<RuleEntity>> GetActiveAsync(CancellationToken cancellationToken = default);
}
