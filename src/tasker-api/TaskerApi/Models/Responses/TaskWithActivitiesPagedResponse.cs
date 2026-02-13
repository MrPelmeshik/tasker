namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ со списком задач с активностями и метаданными пагинации
/// </summary>
public class TaskWithActivitiesPagedResponse
{
    /// <summary>
    /// Список задач с активностями
    /// </summary>
    public List<TaskWithActivitiesResponse> Items { get; set; } = new();

    /// <summary>
    /// Общее число задач по фильтру (при пагинации — полный count; без пагинации — длина Items)
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Текущая страница; null если пагинация не запрашивалась
    /// </summary>
    public int? Page { get; set; }

    /// <summary>
    /// Размер страницы; null если пагинация не запрашивалась
    /// </summary>
    public int? Limit { get; set; }
}
