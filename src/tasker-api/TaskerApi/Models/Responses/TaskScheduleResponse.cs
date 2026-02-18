namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ с информацией о расписании задачи
/// </summary>
public class TaskScheduleResponse
{
    /// <summary>
    /// Идентификатор расписания
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// ID задачи
    /// </summary>
    public Guid TaskId { get; set; }

    /// <summary>
    /// Заголовок задачи
    /// </summary>
    public string TaskTitle { get; set; } = string.Empty;

    /// <summary>
    /// ID области задачи
    /// </summary>
    public Guid AreaId { get; set; }

    /// <summary>
    /// Цвет области (может быть null)
    /// </summary>
    public string? AreaColor { get; set; }

    /// <summary>
    /// Статус задачи (числовой код)
    /// </summary>
    public int TaskStatus { get; set; }

    /// <summary>
    /// Начало временного слота
    /// </summary>
    public DateTimeOffset StartAt { get; set; }

    /// <summary>
    /// Конец временного слота
    /// </summary>
    public DateTimeOffset EndAt { get; set; }

    /// <summary>
    /// Дата создания
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }
}
