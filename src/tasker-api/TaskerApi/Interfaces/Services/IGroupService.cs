using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Сервис для работы с группами
/// </summary>
public interface IGroupService
{
    /// <summary>
    /// Получить все группы
    /// </summary>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Список групп</returns>
    Task<IEnumerable<GroupResponse>> GetAsync(CancellationToken cancellationToken);
    
    /// <summary>
    /// Получить группу по идентификатору
    /// </summary>
    /// <param name="id">Идентификатор группы</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Группа или null</returns>
    Task<GroupResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    
    /// <summary>
    /// Создать новую группу
    /// </summary>
    /// <param name="item">Данные для создания группы</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Созданная группа</returns>
    Task<GroupResponse> CreateAsync(GroupCreateRequest item, CancellationToken cancellationToken);
    
    /// <summary>
    /// Обновить существующую группу
    /// </summary>
    /// <param name="id">Идентификатор группы</param>
    /// <param name="item">Данные для обновления</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Обновленная группа</returns>
    Task<GroupResponse> UpdateAsync(Guid id, GroupUpdateRequest item, CancellationToken cancellationToken);
    
    /// <summary>
    /// Удалить группу
    /// </summary>
    /// <param name="id">Идентификатор группы</param>
    /// <param name="cancellationToken">Токен отмены</param>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
    
    /// <summary>
    /// Получить краткие карточки групп по области
    /// </summary>
    /// <param name="areaId">Идентификатор области</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Список кратких карточек групп</returns>
    Task<IEnumerable<GroupSummaryResponse>> GetGroupShortCardByAreaAsync(Guid areaId, CancellationToken cancellationToken);
    
    /// <summary>
    /// Получить группы по области
    /// </summary>
    /// <param name="areaId">Идентификатор области</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Список групп</returns>
    Task<IEnumerable<GroupResponse>> GetByAreaIdAsync(Guid areaId, CancellationToken cancellationToken);
}
