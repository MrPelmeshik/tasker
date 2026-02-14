namespace TaskerApi.Models.Common;

/// <summary>
/// Настройки сервиса задач (лимиты отчётов и т.п.).
/// </summary>
public class TasksSettings
{
    /// <summary>Максимальный размер страницы для GetTasksWithActivities (защита от перегрузки). По умолчанию 500.</summary>
    public int MaxActivitiesPageSize { get; set; } = 500;
}
