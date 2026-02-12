using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Services.Mapping;

namespace TaskerApi.Services;

/// <summary>
/// Сервис управления участниками области
/// </summary>
public class AreaMemberService(
    IAreaRepository areaRepository,
    IUserAreaAccessRepository userAreaAccessRepository,
    IUserRepository userRepository,
    IAreaRoleService areaRoleService,
    ICurrentUserService currentUserService)
    : IAreaMemberService
{
    /// <inheritdoc />
    public async Task<IReadOnlyList<AreaMemberResponse>> GetMembersAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        if (!await areaRoleService.HasViewAccessAsync(areaId, cancellationToken))
            throw new UnauthorizedAccessException("Доступ к области запрещен");

        var area = await areaRepository.GetByIdAsync(areaId, cancellationToken);
        if (area == null)
            throw new InvalidOperationException("Область не найдена");

        var accessList = await userAreaAccessRepository.GetByAreaIdAsync(areaId, cancellationToken);
        var userIds = new HashSet<Guid> { area.OwnerUserId };
        foreach (var a in accessList)
            userIds.Add(a.UserId);

        var users = await userRepository.FindAsync(u => userIds.Contains(u.Id), cancellationToken);
        var userNames = users.ToDictionary(u => u.Id, u => u.Name);

        var result = new List<AreaMemberResponse>();

        // Владелец всегда первый
        result.Add(new AreaMemberResponse
        {
            UserId = area.OwnerUserId,
            UserName = userNames.GetValueOrDefault(area.OwnerUserId, ""),
            Role = AreaRole.Owner
        });

        // Остальные участники из user_area_access (без дублирования владельца)
        foreach (var access in accessList.Where(a => a.UserId != area.OwnerUserId))
        {
            result.Add(new AreaMemberResponse
            {
                UserId = access.UserId,
                UserName = userNames.GetValueOrDefault(access.UserId, ""),
                Role = access.Role
            });
        }

        return result;
    }

    /// <inheritdoc />
    public async Task AddMemberAsync(Guid areaId, AddAreaMemberRequest request, CancellationToken cancellationToken = default)
    {
        if (request.Role == AreaRole.Owner)
            throw new InvalidOperationException("Для передачи роли владельца используйте эндпоинт transfer-owner");

        var area = await areaRepository.GetByIdAsync(areaId, cancellationToken);
        if (area == null)
            throw new InvalidOperationException("Область не найдена");

        if (request.Role == AreaRole.Administrator)
        {
            if (!await areaRoleService.CanAppointAdminAsync(areaId, cancellationToken))
                throw new UnauthorizedAccessException("Только владелец может назначать администраторов");
        }
        else
        {
            if (!await areaRoleService.CanAppointExecutorOrObserverAsync(areaId, cancellationToken))
                throw new UnauthorizedAccessException("Нет прав на назначение участников");
        }

        var hasLogin = !string.IsNullOrWhiteSpace(request.Login);
        var hasUserId = request.UserId.HasValue;
        if (!hasLogin && !hasUserId)
            throw new InvalidOperationException("Укажите UserId или Login");

        UserEntity? targetUser;
        if (hasLogin)
            targetUser = await userRepository.GetByNameAsync(request.Login!.Trim(), cancellationToken);
        else
            targetUser = await userRepository.GetByIdAsync(request.UserId!.Value, cancellationToken);

        if (targetUser == null)
            throw new InvalidOperationException("Пользователь не найден");

        var targetUserId = targetUser.Id;
        var existingAccess = (await userAreaAccessRepository.GetByAreaIdAsync(areaId, cancellationToken))
            .FirstOrDefault(a => a.UserId == targetUserId && a.IsActive);

        if (existingAccess != null)
        {
            existingAccess.Role = request.Role;
            existingAccess.GrantedByUserId = currentUserService.UserId;
            await userAreaAccessRepository.UpdateAsync(existingAccess, cancellationToken);
        }
        else
        {
            var userAccess = area.ToUserAreaAccessEntity(targetUserId, currentUserService.UserId, request.Role);
            await userAreaAccessRepository.CreateAsync(userAccess, cancellationToken);
        }
    }

    /// <inheritdoc />
    public async Task RemoveMemberAsync(Guid areaId, Guid userId, CancellationToken cancellationToken = default)
    {
        var area = await areaRepository.GetByIdAsync(areaId, cancellationToken);
        if (area == null)
            throw new InvalidOperationException("Область не найдена");

        if (area.OwnerUserId == userId)
            throw new InvalidOperationException("Нельзя удалить владельца. Сначала передайте роль владельца другому пользователю");

        var accessList = await userAreaAccessRepository.GetByAreaIdAsync(areaId, cancellationToken);
        var access = accessList.FirstOrDefault(a => a.UserId == userId && a.IsActive);
        if (access == null)
            throw new InvalidOperationException("Участник не найден в области");

        if (access.Role == AreaRole.Administrator && !await areaRoleService.CanAppointAdminAsync(areaId, cancellationToken))
            throw new UnauthorizedAccessException("Только владелец может удалить администратора");

        if (access.Role is AreaRole.Executor or AreaRole.Observer
            && !await areaRoleService.CanAppointExecutorOrObserverAsync(areaId, cancellationToken))
            throw new UnauthorizedAccessException("Нет прав на удаление участников");

        await userAreaAccessRepository.DeleteAsync(access.Id, cancellationToken);
    }

    /// <inheritdoc />
    public async Task TransferOwnerAsync(Guid areaId, TransferOwnerRequest request, CancellationToken cancellationToken = default)
    {
        if (!await areaRoleService.CanTransferOwnerAsync(areaId, cancellationToken))
            throw new UnauthorizedAccessException("Только владелец может передать роль владельца");

        var area = await areaRepository.GetByIdAsync(areaId, cancellationToken);
        if (area == null)
            throw new InvalidOperationException("Область не найдена");

        var newOwner = await userRepository.GetByIdAsync(request.NewOwnerUserId, cancellationToken);
        if (newOwner == null)
            throw new InvalidOperationException("Пользователь не найден");

        var oldOwnerId = area.OwnerUserId;
        if (oldOwnerId == request.NewOwnerUserId)
            throw new InvalidOperationException("Пользователь уже является владельцем");

        var accessList = await userAreaAccessRepository.GetByAreaIdAsync(areaId, cancellationToken);
        var oldOwnerAccess = accessList.FirstOrDefault(a => a.UserId == oldOwnerId && a.IsActive);
        var newOwnerAccess = accessList.FirstOrDefault(a => a.UserId == request.NewOwnerUserId && a.IsActive);

        if (oldOwnerAccess != null)
        {
            await userAreaAccessRepository.DeleteAsync(oldOwnerAccess.Id, cancellationToken);
        }

        if (newOwnerAccess != null)
        {
            newOwnerAccess.Role = AreaRole.Owner;
            await userAreaAccessRepository.UpdateAsync(newOwnerAccess, cancellationToken);
        }
        else
        {
            var userAccess = area.ToUserAreaAccessEntity(request.NewOwnerUserId, oldOwnerId, AreaRole.Owner);
            await userAreaAccessRepository.CreateAsync(userAccess, cancellationToken);
        }

        area.OwnerUserId = request.NewOwnerUserId;
        await areaRepository.UpdateAsync(area, cancellationToken);
    }
}
