using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Базовый интерфейс для работы с событиями сущностей
/// </summary>
public interface IEventEntityService
{
    /// <summary>
    /// Добавить событие активности к сущности
    /// </summary>
    /// <param name="item">Данные события</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Созданное событие</returns>
    Task<EventCreateResponse> AddEventAsync(EventCreateEntityRequest item, CancellationToken cancellationToken);

    /// <summary>
    /// Обновить событие по идентификатору (частичное обновление).
    /// </summary>
    Task UpdateEventAsync(Guid eventId, EventUpdateEntityRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Мягко удалить событие по идентификатору.
    /// </summary>
    Task DeleteEventAsync(Guid eventId, CancellationToken cancellationToken);
}