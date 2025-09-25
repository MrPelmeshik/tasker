using System.Security.Claims;
using TaskerApi.Interfaces.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;

namespace TaskerApi.Services;

public class CurrentUserService: ICurrentUserService
{
    public Guid UserId { get; }
    
    public bool IsAuthenticated { get; }

    private readonly UserEntity? _user;

    public required IReadOnlyList<Guid> AccessibleAreas { get; init; }
    
    public required IReadOnlyList<Guid> AccessibleGroups { get; init; }

    public CurrentUserService(
        IHttpContextAccessor httpContextAccessor,
        IUnitOfWorkFactory uowFactory,
        IUserProvider userProvider,
        IUserAreaAccessProvider userAreaAccessProvider)
    {
        var principal = httpContextAccessor.HttpContext?.User;
        
        UserId = Guid.TryParse(principal?.FindFirstValue(ClaimTypes.NameIdentifier), out var guid) 
            ? guid 
            : Guid.Empty;
        IsAuthenticated = principal?.Identity?.IsAuthenticated ?? false;
        
        var (user, accessibleAreas, accessibleGroups) = GetUserAndAccessibleData(
                uowFactory, 
                userProvider, 
                userAreaAccessProvider)
            .GetAwaiter()
            .GetResult();
        
        _user = user;
        AccessibleAreas = accessibleAreas;
        AccessibleGroups = accessibleGroups;
    }

    public bool HasAccessToArea(Guid areaId)
    {
        if (!IsAuthenticated || UserId == Guid.Empty)
            return false;

        return AccessibleAreas.Contains(areaId);
    }
    
    public bool HasAccessToArea(IList<Guid> areaIds)
    {
        if (!IsAuthenticated || UserId == Guid.Empty || !areaIds.Any())
            return false;

        return areaIds.Intersect(AccessibleAreas).Any();
    }
    
    public bool HasAccessToGroup(Guid groupId)
    {
        if (!IsAuthenticated || UserId == Guid.Empty)
            return false;

        return AccessibleGroups.Contains(groupId);
    }
    
    public bool HasAccessToGroup(IList<Guid> groupIds)
    {
        if (!IsAuthenticated || UserId == Guid.Empty || !groupIds.Any())
            return false;

        return groupIds.Intersect(AccessibleGroups).Any();
    }
    
    private async Task<(UserEntity?, IReadOnlyList<Guid>, IReadOnlyList<Guid>)> GetUserAndAccessibleData(
        IUnitOfWorkFactory uowFactory, 
        IUserProvider userProvider, 
        IUserAreaAccessProvider userAreaAccessProvider)
    {
        var cancellationToken = CancellationToken.None;
        await using var uow = await uowFactory.CreateAsync(cancellationToken);

        var user = await userProvider
            .GetByIdAsync(
                uow.Connection,
                UserId,
                cancellationToken);
        var accessibleAreas = await userAreaAccessProvider
            .GetUserAccessibleAreaIdsAsync(
                uow.Connection,
                UserId,
                cancellationToken);

        // Получаем все группы из доступных областей
        var accessibleGroups = await userAreaAccessProvider
            .GetUserAccessibleGroupIdsAsync(
                uow.Connection,
                UserId,
                cancellationToken);

        return (user, accessibleAreas.ToArray().AsReadOnly(), accessibleGroups.ToArray().AsReadOnly());
    }
}


