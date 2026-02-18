namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на создание расписания задачи
/// </summary>
public class TaskScheduleCreateRequest
{
    /// <summary>
    /// ID задачи
    /// </summary>
    public Guid TaskId { get; set; }

    /// <summary>
    /// Начало временного слота
    /// </summary>
    public DateTimeOffset StartAt { get; set; }

    /// <summary>
    /// Конец временного слота
    /// </summary>
    public DateTimeOffset EndAt { get; set; }
}
