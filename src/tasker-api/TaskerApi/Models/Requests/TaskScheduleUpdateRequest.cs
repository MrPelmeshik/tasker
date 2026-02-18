namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на обновление расписания задачи
/// </summary>
public class TaskScheduleUpdateRequest
{
    /// <summary>
    /// Начало временного слота
    /// </summary>
    public DateTimeOffset StartAt { get; set; }

    /// <summary>
    /// Конец временного слота
    /// </summary>
    public DateTimeOffset EndAt { get; set; }
}
