using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Interfaces.Services;

public interface ITaskService
{
    /// <summary>
    /// Получить все задачи пользователя из доступных областей
    /// </summary>
    Task<IEnumerable<TaskResponse>> GetAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Получить задачу по идентификатору
    /// </summary>
    Task<TaskResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Создать новую задачу
    /// </summary>
    Task<TaskResponse> CreateAsync(TaskCreateRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Обновить существующую задачу
    /// </summary>
    Task<TaskResponse> UpdateAsync(Guid id, TaskUpdateRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Удалить задачу
    /// </summary>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Получить краткие карточки задач по папке
    /// </summary>
    Task<IEnumerable<TaskSummaryResponse>> GetTaskSummaryByFolderAsync(Guid folderId, CancellationToken cancellationToken);

    /// <summary>
    /// Получить краткие карточки задач в корне области
    /// </summary>
    Task<IEnumerable<TaskSummaryResponse>> GetTaskSummaryByAreaRootAsync(Guid areaId, CancellationToken cancellationToken);

    /// <summary>
    /// Получить недельную активность задач
    /// </summary>
    Task<IEnumerable<TaskWeeklyActivityResponse>> GetWeeklyActivityAsync(TaskWeeklyActivityRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Получить задачи с активностями по гибкому фильтру
    /// </summary>
    Task<TaskWithActivitiesPagedResponse> GetTasksWithActivitiesAsync(TaskWithActivitiesFilterRequest request, CancellationToken cancellationToken);
}


