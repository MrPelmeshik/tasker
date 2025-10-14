using TaskerApi.Interfaces.Core;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Базовый сервис для работы с событиями сущностей
/// </summary>
public interface IEventEntityService
{
    /// <summary>
    /// Добавить событие создания сущности
    /// </summary>
    /// <param name="uow">Единица работы</param>
    /// <param name="entityId">Идентификатор сущности</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Созданное событие</returns>
    Task<EventCreateResponse> AddEventCreateEntityAsync(IUnitOfWork uow, Guid entityId, CancellationToken cancellationToken);
    
    /// <summary>
    /// Добавить событие обновления сущности
    /// </summary>
    /// <param name="uow">Единица работы</param>
    /// <param name="entityId">Идентификатор сущности</param>
    /// <param name="changes">Описание изменений</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Созданное событие</returns>
    Task<EventCreateResponse> AddEventUpdateEntityAsync(IUnitOfWork uow, Guid entityId, string changes, CancellationToken cancellationToken);
    
    /// <summary>
    /// Добавить событие удаления сущности
    /// </summary>
    /// <param name="uow">Единица работы</param>
    /// <param name="entityId">Идентификатор сущности</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Созданное событие</returns>
    Task<EventCreateResponse> AddEventDeleteEntityAsync(IUnitOfWork uow, Guid entityId, CancellationToken cancellationToken);
    
    /// <summary>
    /// Добавить событие с единицей работы
    /// </summary>
    /// <param name="uow">Единица работы</param>
    /// <param name="item">Данные события</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Созданное событие</returns>
    Task<EventCreateResponse> AddEventAsync(IUnitOfWork uow, EventCreateEntityRequest item, CancellationToken cancellationToken);
    
    /// <summary>
    /// Добавить событие без единицы работы
    /// </summary>
    /// <param name="item">Данные события</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Созданное событие</returns>
    Task<EventCreateResponse> AddEventAsync(EventCreateEntityRequest item, CancellationToken cancellationToken);
}