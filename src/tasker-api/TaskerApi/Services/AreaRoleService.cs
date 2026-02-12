using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;

namespace TaskerApi.Services;

/// <summary>
/// Сервис проверки ролей и прав доступа в области
/// </summary>
public class AreaRoleService(
    IAreaRepository areaRepository,
    IUserAreaAccessRepository userAreaAccessRepository,
    ICurrentUserService currentUserService)
    : IAreaRoleService
{
    /// <inheritdoc />
    public async Task<AreaRole?> GetUserRoleAsync(Guid areaId, Guid userId, CancellationToken cancellationToken = default)
    {
        var area = await areaRepository.GetByIdAsync(areaId, cancellationToken);
        if (area == null)
            return null;

        if (area.OwnerUserId == userId)
            return AreaRole.Owner;

        var accessList = await userAreaAccessRepository.GetByAreaIdAsync(areaId, cancellationToken, includeDeleted: false);
        var access = accessList.FirstOrDefault(a => a.UserId == userId && a.IsActive);
        return access != null ? access.Role : null;
    }

    /// <inheritdoc />
    public async Task<bool> HasViewAccessAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        var role = await GetUserRoleAsync(areaId, currentUserService.UserId, cancellationToken);
        return role.HasValue; // Любая роль даёт право на просмотр
    }

    /// <inheritdoc />
    public async Task<bool> CanAddActivityAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        var role = await GetUserRoleAsync(areaId, currentUserService.UserId, cancellationToken);
        return role is AreaRole.Owner or AreaRole.Administrator or AreaRole.Executor;
    }

    /// <inheritdoc />
    public async Task<bool> CanEditAreaAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        var role = await GetUserRoleAsync(areaId, currentUserService.UserId, cancellationToken);
        return role is AreaRole.Owner or AreaRole.Administrator;
    }

    /// <inheritdoc />
    public async Task<bool> CanEditGroupAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        var role = await GetUserRoleAsync(areaId, currentUserService.UserId, cancellationToken);
        return role is AreaRole.Owner or AreaRole.Administrator or AreaRole.Executor;
    }

    /// <inheritdoc />
    public async Task<bool> CanEditTaskAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        var role = await GetUserRoleAsync(areaId, currentUserService.UserId, cancellationToken);
        return role is AreaRole.Owner or AreaRole.Administrator or AreaRole.Executor;
    }

    /// <inheritdoc />
    public async Task<bool> CanCreateOrDeleteStructureAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        var role = await GetUserRoleAsync(areaId, currentUserService.UserId, cancellationToken);
        return role == AreaRole.Owner;
    }

    /// <inheritdoc />
    public async Task<bool> CanAppointAdminAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        var role = await GetUserRoleAsync(areaId, currentUserService.UserId, cancellationToken);
        return role == AreaRole.Owner;
    }

    /// <inheritdoc />
    public async Task<bool> CanAppointExecutorOrObserverAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        var role = await GetUserRoleAsync(areaId, currentUserService.UserId, cancellationToken);
        return role is AreaRole.Owner or AreaRole.Administrator;
    }

    /// <inheritdoc />
    public async Task<bool> CanTransferOwnerAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        var role = await GetUserRoleAsync(areaId, currentUserService.UserId, cancellationToken);
        return role == AreaRole.Owner;
    }
}
