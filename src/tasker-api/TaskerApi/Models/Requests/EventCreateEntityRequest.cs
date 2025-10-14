using TaskerApi.Models.Common;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на создание события для сущности.
/// </summary>
public class EventCreateEntityRequest
{
    /// <summary>
    /// Идентификатор сущности.
    /// </summary>
    public Guid EntityId { get; set; }
    
    /// <summary>
    /// Заголовок события.
    /// </summary>
    public string Title { get; set; } = string.Empty;
    
    /// <summary>
    /// Описание события.
    /// </summary>
    public string? Description { get; set; }
    
    /// <summary>
    /// Тип события.
    /// </summary>
    public EventType EventType { get; set; }
}