using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Сервис для работы с областями
/// </summary>
public interface IAreaService
{
    /// <summary>
    /// Получить все области
    /// </summary>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Список областей</returns>
    Task<IEnumerable<AreaResponse>> GetAllAsync(CancellationToken cancellationToken);
    
    /// <summary>
    /// Получить область по идентификатору
    /// </summary>
    /// <param name="id">Идентификатор области</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Область или null</returns>
    Task<AreaResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    
    /// <summary>
    /// Создать новую область
    /// </summary>
    /// <param name="item">Данные для создания области</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Созданная область</returns>
    Task<AreaCreateResponse> CreateAsync(AreaCreateRequest item, CancellationToken cancellationToken);
    
    /// <summary>
    /// Обновить существующую область
    /// </summary>
    /// <param name="id">Идентификатор области</param>
    /// <param name="item">Данные для обновления</param>
    /// <param name="cancellationToken">Токен отмены</param>
    Task UpdateAsync(Guid id, AreaUpdateRequest item, CancellationToken cancellationToken);
    
    /// <summary>
    /// Удалить область
    /// </summary>
    /// <param name="id">Идентификатор области</param>
    /// <param name="cancellationToken">Токен отмены</param>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
    
    /// <summary>
    /// Получить краткие карточки областей
    /// </summary>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Список кратких карточек областей</returns>
    Task<IEnumerable<AreaShortCardResponse>> GetAreaShortCardAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Создать область с группой по умолчанию
    /// </summary>
    /// <param name="request">Данные для создания области с группой</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Созданная область с группой</returns>
    Task<CreateAreaWithGroupResponse> CreateWithDefaultGroupAsync(CreateAreaWithGroupRequest request, CancellationToken cancellationToken);
}