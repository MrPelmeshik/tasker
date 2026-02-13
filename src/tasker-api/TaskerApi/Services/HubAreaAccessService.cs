using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;

namespace TaskerApi.Services;

/// <summary>
/// Реализация сервиса доступа к областям для SignalR Hub
/// </summary>
public class HubAreaAccessService(
    IUserAreaAccessRepository userAreaAccessRepository,
    IAreaRepository areaRepository)
    : IHubAreaAccessService
{
    /// <inheritdoc />
    public async Task<IReadOnlyList<Guid>> GetAccessibleAreaIdsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var userAreaAccesses = await userAreaAccessRepository.GetByUserIdAsync(userId, cancellationToken);
        var fromAccess = userAreaAccesses.Select(uaa => uaa.AreaId).ToHashSet();
        var ownerAreas = await areaRepository.GetByOwnerIdAsync(userId, cancellationToken);
        var fromOwner = ownerAreas.Select(a => a.Id);
        return fromAccess.Union(fromOwner).Distinct().ToList();
    }
}
