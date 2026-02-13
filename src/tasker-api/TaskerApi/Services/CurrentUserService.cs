using System.Security.Claims;
using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для работы с текущим пользователем
/// </summary>
public class CurrentUserService: ICurrentUserService
{
    /// <summary>
    /// Идентификатор текущего пользователя
    /// </summary>
    public Guid UserId { get; }
    
    /// <summary>
    /// Флаг аутентификации пользователя
    /// </summary>
    public bool IsAuthenticated { get; }

    private readonly IUserRepository _userRepository;
    private readonly IUserAreaAccessRepository _userAreaAccessRepository;
    private readonly IAreaRepository _areaRepository;
    private UserEntity? _user;
    private IReadOnlyList<Guid>? _accessibleAreas;

    public CurrentUserService(
        IHttpContextAccessor httpContextAccessor,
        IUserRepository userRepository,
        IUserAreaAccessRepository userAreaAccessRepository,
        IAreaRepository areaRepository)
    {
        _userRepository = userRepository;
        _userAreaAccessRepository = userAreaAccessRepository;
        _areaRepository = areaRepository;
        
        var principal = httpContextAccessor.HttpContext?.User;
        
        UserId = Guid.TryParse(principal?.FindFirstValue(ClaimTypes.NameIdentifier), out var guid)
            ? guid
            : Guid.Empty;
            
        IsAuthenticated = UserId != Guid.Empty && principal?.Identity?.IsAuthenticated == true;
    }

    /// <summary>
    /// Список доступных областей для пользователя
    /// </summary>
    public IReadOnlyList<Guid> AccessibleAreas =>
        _accessibleAreas ??= LoadAccessibleAreas();

    /// <summary>
    /// Получить данные текущего пользователя
    /// </summary>
    /// <returns>Данные пользователя или null</returns>
    public UserEntity? GetUser()
    {
        return _user ??= LoadUser();
    }

    /// <summary>
    /// Проверить доступ к области
    /// </summary>
    /// <param name="areaId">Идентификатор области</param>
    /// <returns>True, если есть доступ</returns>
    public bool HasAccessToArea(Guid areaId)
    {
        return AccessibleAreas.Contains(areaId);
    }

    /// <summary>
    /// Проверить доступ к любой из областей
    /// </summary>
    /// <param name="areaIds">Список идентификаторов областей</param>
    /// <returns>True, если есть доступ к любой области</returns>
    public bool HasAccessToArea(IList<Guid> areaIds)
    {
        return areaIds.Any(id => AccessibleAreas.Contains(id));
    }

    /// <summary>
    /// Проверить, является ли пользователь администратором
    /// </summary>
    /// <returns>True, если пользователь администратор</returns>
    public bool IsAdmin()
    {
        return GetUser()?.IsAdmin ?? false;
    }

    /// <summary>
    /// Проверить, активен ли пользователь
    /// </summary>
    /// <returns>True, если пользователь активен</returns>
    public bool IsActive()
    {
        return GetUser()?.IsActive ?? false;
    }

    private UserEntity? LoadUser()
    {
        if (!IsAuthenticated) return null;
        
        try
        {
            return _userRepository.GetByIdAsync(UserId, CancellationToken.None).Result;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Загружает области, к которым пользователь имеет доступ: владелец (areas.owner_user_id) или запись в user_area_access
    /// </summary>
    private IReadOnlyList<Guid> LoadAccessibleAreas()
    {
        if (!IsAuthenticated) return new List<Guid>();
        
        try
        {
            var userAreaAccesses = _userAreaAccessRepository.GetByUserIdAsync(UserId, CancellationToken.None).Result;
            var fromAccess = userAreaAccesses.Select(uaa => uaa.AreaId).ToHashSet();
            var ownerAreas = _areaRepository.GetByOwnerIdAsync(UserId, CancellationToken.None).Result;
            var fromOwner = ownerAreas.Select(a => a.Id);
            return fromAccess.Union(fromOwner).Distinct().ToList();
        }
        catch
        {
            return new List<Guid>();
        }
    }
}