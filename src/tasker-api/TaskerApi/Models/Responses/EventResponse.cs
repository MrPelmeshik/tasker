namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ с информацией о событии.
/// </summary>
public class EventResponse
{
    /// <summary>
    /// Уникальный идентификатор события.
    /// </summary>
    public Guid Id { get; set; }
    
    /// <summary>
    /// Заголовок события.
    /// </summary>
    public string Title { get; set; } = string.Empty;
    
    /// <summary>
    /// Сообщение события в формате JSON (детализация).
    /// </summary>
    public System.Text.Json.JsonElement? Message { get; set; }
    
    /// <summary>
    /// Тип события.
    /// </summary>
    public string EventType { get; set; } = string.Empty;
    
    /// <summary>
    /// Идентификатор пользователя-владельца.
    /// </summary>
    public Guid OwnerUserId { get; set; }

    /// <summary>
    /// Имя пользователя-владельца.
    /// </summary>
    public string OwnerUserName { get; set; } = string.Empty;
    
    /// <summary>
    /// Дата и время создания.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Дата события/активности.
    /// </summary>
    public DateTimeOffset EventDate { get; set; }
    
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
