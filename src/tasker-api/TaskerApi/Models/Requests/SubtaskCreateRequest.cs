namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на создание подзадачи.
/// </summary>
public class SubtaskCreateRequest
{
    /// <summary>
    /// Заголовок подзадачи.
    /// </summary>
    public string Title { get; set; } = string.Empty;
    
    /// <summary>
    /// Описание подзадачи.
    /// </summary>
    public string Description { get; set; } = string.Empty;
    
    /// <summary>
    /// Идентификатор задачи.
    /// </summary>
    public Guid TaskId { get; set; }
}
