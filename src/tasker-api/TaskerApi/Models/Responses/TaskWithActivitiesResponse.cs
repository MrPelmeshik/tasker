namespace TaskerApi.Models.Responses;

/// <summary>
/// Карточка задачи с активностями по дням для отображения в таблице
/// </summary>
public class TaskWithActivitiesResponse
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
    /// Статус задачи
    /// </summary>
    public int Status { get; set; }

    /// <summary>
    /// Идентификатор группы
    /// </summary>
    public Guid GroupId { get; set; }

    /// <summary>
    /// Есть ли активности до диапазона
    /// </summary>
    public int CarryWeeks { get; set; }

    /// <summary>
    /// Есть ли активности после диапазона
    /// </summary>
    public bool HasFutureActivities { get; set; }

    /// <summary>
    /// Активности по дням в выбранном диапазоне
    /// </summary>
    public List<TaskDayActivityResponse> Days { get; set; } = new();
}
