namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ с информацией о недельной активности задачи
/// </summary>
public class TaskWeeklyActivityResponse
{
    /// <summary>
    /// Идентификатор задачи
    /// </summary>
    public Guid TaskId { get; set; }

    /// <summary>
    /// Название задачи
    /// </summary>
    public string TaskName { get; set; } = string.Empty;

    /// <summary>
    /// Количество недель переноса
    /// </summary>
    public int CarryWeeks { get; set; }

    /// <summary>
    /// Есть ли активности в будущих неделях
    /// </summary>
    public bool HasFutureActivities { get; set; }

    /// <summary>
    /// Активности по дням недели
    /// </summary>
    public List<TaskDayActivityResponse> Days { get; set; } = new();

    /// <summary>
    /// Типы событий в прошлых неделях (для индикаторов)
    /// </summary>
    public List<int> PastEventTypes { get; set; } = new();

    /// <summary>
    /// Типы событий в будущих неделях (для индикаторов)
    /// </summary>
    public List<int> FutureEventTypes { get; set; } = new();
}
