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

    /// <summary>
    /// Список событий за день (для детализации)
    /// </summary>
    public List<EventShortInfo> Events { get; set; } = new();
}

/// <summary>
/// Краткая информация о событии
/// </summary>
public class EventShortInfo
{
    public Guid Id { get; set; }
    public int EventType { get; set; }
}
