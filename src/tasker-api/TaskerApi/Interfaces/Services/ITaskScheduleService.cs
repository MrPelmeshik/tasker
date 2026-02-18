using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Сервис для работы с расписаниями задач
/// </summary>
public interface ITaskScheduleService
{
    /// <summary>
    /// Создать расписание
    /// </summary>
    Task<TaskScheduleResponse> CreateAsync(TaskScheduleCreateRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Обновить расписание
    /// </summary>
    Task<TaskScheduleResponse> UpdateAsync(Guid id, TaskScheduleUpdateRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Удалить расписание (soft delete)
    /// </summary>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Получить расписания по задаче
    /// </summary>
    Task<IReadOnlyList<TaskScheduleResponse>> GetByTaskIdAsync(Guid taskId, CancellationToken cancellationToken);

    /// <summary>
    /// Получить расписания за неделю
    /// </summary>
    Task<IReadOnlyList<TaskScheduleResponse>> GetByWeekAsync(string weekStartIso, CancellationToken cancellationToken);
}
