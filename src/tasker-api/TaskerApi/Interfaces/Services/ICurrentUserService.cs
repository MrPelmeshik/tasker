using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Сервис для работы с текущим пользователем
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Идентификатор текущего пользователя
    /// </summary>
    Guid UserId { get; }
    
    /// <summary>
    /// Признак аутентификации пользователя
    /// </summary>
    bool IsAuthenticated { get; }
    
    /// <summary>
    /// Список доступных областей для пользователя
    /// </summary>
    IReadOnlyList<Guid> AccessibleAreas { get; }
    
    /// <summary>
    /// Список доступных групп для пользователя
    /// </summary>
    IReadOnlyList<Guid> AccessibleGroups { get; }
    
    /// <summary>
    /// Проверить доступ к области
    /// </summary>
    /// <param name="areaId">Идентификатор области</param>
    /// <returns>True если есть доступ</returns>
    bool HasAccessToArea(Guid areaId);
    
    /// <summary>
    /// Проверить доступ к списку областей
    /// </summary>
    /// <param name="areaId">Список идентификаторов областей</param>
    /// <returns>True если есть доступ ко всем областям</returns>
    bool HasAccessToArea(IList<Guid> areaId);
    
    /// <summary>
    /// Проверить доступ к группе
    /// </summary>
    /// <param name="groupId">Идентификатор группы</param>
    /// <returns>True если есть доступ</returns>
    bool HasAccessToGroup(Guid groupId);
    
    /// <summary>
    /// Проверить доступ к списку групп
    /// </summary>
    /// <param name="groupIds">Список идентификаторов групп</param>
    /// <returns>True если есть доступ ко всем группам</returns>
    bool HasAccessToGroup(IList<Guid> groupIds);
}
