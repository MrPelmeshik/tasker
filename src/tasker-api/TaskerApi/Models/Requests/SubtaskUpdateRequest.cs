using TaskerApi.Models.Common;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на обновление подзадачи.
/// </summary>
public class SubtaskUpdateRequest
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
    /// Статус подзадачи.
    /// </summary>
    public Common.TaskStatus Status { get; set; }
}
