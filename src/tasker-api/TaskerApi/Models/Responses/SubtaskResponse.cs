using TaskerApi.Models.Common;

namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ с информацией о подзадаче.
/// </summary>
public class SubtaskResponse
{
    /// <summary>
    /// Уникальный идентификатор подзадачи.
    /// </summary>
    public Guid Id { get; set; }
    
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
    
    /// <summary>
    /// Идентификатор задачи.
    /// </summary>
    public Guid TaskId { get; set; }
    
    /// <summary>
    /// Идентификатор пользователя-создателя.
    /// </summary>
    public Guid CreatorUserId { get; set; }
    
    /// <summary>
    /// Дата и время создания.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }
    
    /// <summary>
    /// Дата и время последнего обновления.
    /// </summary>
    public DateTimeOffset UpdatedAt { get; set; }
    
    /// <summary>
    /// Флаг активности записи.
    /// </summary>
    public bool IsActive { get; set; }
    
    /// <summary>
    /// Дата и время деактивации (мягкое удаление).
    /// </summary>
    public DateTimeOffset? DeactivatedAt { get; set; }
}
