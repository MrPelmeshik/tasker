namespace TaskerApi.Models.Responses;

/// <summary>
/// Краткая информация о задаче
/// </summary>
public class TaskSummaryResponse
{
    /// <summary>
    /// Идентификатор задачи
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Заголовок задачи
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Описание задачи
    /// </summary>
    public string? Description { get; set; }
}
