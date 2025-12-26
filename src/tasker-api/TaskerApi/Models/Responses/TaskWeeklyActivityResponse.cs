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
}

/// <summary>
/// Активность задачи за день
/// </summary>
public class TaskDayActivityResponse
{
    /// <summary>
    /// Дата в формате ISO (YYYY-MM-DD)
    /// </summary>
    public string Date { get; set; } = string.Empty;

    /// <summary>
    /// Количество активностей за день
    /// </summary>
    public int Count { get; set; }
}
