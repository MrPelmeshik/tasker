using TaskerApi.Models.Responses;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Сервис для работы с событиями задач
/// </summary>
public interface IEventTaskService : IEventEntityService
{
    /// <summary>
    /// Получить список событий по идентификатору задачи
    /// </summary>
    Task<IReadOnlyList<EventResponse>> GetEventsByTaskIdAsync(Guid taskId, CancellationToken cancellationToken);
}