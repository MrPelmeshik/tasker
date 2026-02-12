using TaskerApi.Models.Responses;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Сервис для работы с событиями групп
/// </summary>
public interface IEventGroupService : IEventEntityService
{
    /// <summary>
    /// Получить список событий по идентификатору группы
    /// </summary>
    Task<IReadOnlyList<EventResponse>> GetEventsByGroupIdAsync(Guid groupId, CancellationToken cancellationToken);
}