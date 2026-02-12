namespace TaskerApi.Models.Responses;

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
