using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

public interface IAreaMembershipService : ICrudService<AreaMembershipEntity, Guid>
{
    Task<IEnumerable<AreaMembershipEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default);
    Task<IEnumerable<AreaMembershipEntity>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Guid> AddMemberAsync(Guid areaId, Guid userId, string role, CancellationToken cancellationToken = default);
    Task RemoveMemberAsync(Guid areaId, Guid userId, CancellationToken cancellationToken = default);
    Task ChangeRoleAsync(Guid areaId, Guid userId, string newRole, CancellationToken cancellationToken = default);
    Task<bool> IsMemberAsync(Guid areaId, Guid userId, CancellationToken cancellationToken = default);
    Task<string?> GetRoleAsync(Guid areaId, Guid userId, CancellationToken cancellationToken = default);
}
