using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Repositories;

/// <summary>
/// Репозиторий для работы с расписаниями задач
/// </summary>
public interface ITaskScheduleRepository : IRepository<TaskScheduleEntity, Guid>
{
    /// <summary>
    /// Получить расписания по задаче
    /// </summary>
    Task<IReadOnlyList<TaskScheduleEntity>> GetByTaskIdAsync(Guid taskId, CancellationToken ct = default);

    /// <summary>
    /// Получить расписания, перекрывающие указанный диапазон дат
    /// </summary>
    Task<IReadOnlyList<TaskScheduleEntity>> GetByDateRangeAsync(DateTimeOffset from, DateTimeOffset to, CancellationToken ct = default);
}
