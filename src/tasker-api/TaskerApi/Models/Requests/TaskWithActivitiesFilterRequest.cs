using System.ComponentModel.DataAnnotations;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на получение задач с активностями и фильтрацией
/// </summary>
public class TaskWithActivitiesFilterRequest
{
    /// <summary>
    /// Дата начала диапазона (ISO YYYY-MM-DD)
    /// </summary>
    [Required(ErrorMessage = "Дата начала обязательна")]
    [RegularExpression(@"^\d{4}-\d{2}-\d{2}$", ErrorMessage = "Формат даты: YYYY-MM-DD")]
    public string DateFrom { get; set; } = string.Empty;

    /// <summary>
    /// Дата конца диапазона (ISO YYYY-MM-DD)
    /// </summary>
    [Required(ErrorMessage = "Дата конца обязательна")]
    [RegularExpression(@"^\d{4}-\d{2}-\d{2}$", ErrorMessage = "Формат даты: YYYY-MM-DD")]
    public string DateTo { get; set; } = string.Empty;

    /// <summary>
    /// Фильтр по статусам задач (1–5). При null или пустом — без фильтра по статусу
    /// </summary>
    public int[]? Statuses { get; set; }

    /// <summary>
    /// Включить задачи, у которых есть активности в диапазоне, даже если статус не в Statuses
    /// </summary>
    public bool IncludeTasksWithActivitiesInRange { get; set; } = true;

    /// <summary>
    /// Номер страницы (1-based). Пагинация применяется только при одновременном указании Page и Limit
    /// </summary>
    [Range(1, 10000, ErrorMessage = "Page должен быть от 1 до 10000")]
    public int? Page { get; set; }

    /// <summary>
    /// Размер страницы. Пагинация применяется только при одновременном указании Page и Limit
    /// </summary>
    [Range(1, 500, ErrorMessage = "Limit должен быть от 1 до 500")]
    public int? Limit { get; set; }
}
