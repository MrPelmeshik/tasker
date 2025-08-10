using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Providers;

public interface IAreaMembershipProvider : ICrudProvider<AreaMembershipEntity, Guid>
{
    Task<IEnumerable<AreaMembershipEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default);
    Task<IEnumerable<AreaMembershipEntity>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<AreaMembershipEntity?> GetByAreaAndUserAsync(Guid areaId, Guid userId, CancellationToken cancellationToken = default);
}
