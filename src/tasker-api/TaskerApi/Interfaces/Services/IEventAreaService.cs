using TaskerApi.Models.Responses;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Сервис для работы с событиями областей
/// </summary>
public interface IEventAreaService : IEventEntityService
{
    /// <summary>
    /// Получить список событий по идентификатору области
    /// </summary>
    Task<IReadOnlyList<EventResponse>> GetEventsByAreaIdAsync(Guid areaId, CancellationToken cancellationToken);
}