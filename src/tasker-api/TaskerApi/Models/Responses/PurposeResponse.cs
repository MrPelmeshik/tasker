namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ с информацией о цели.
/// </summary>
public class PurposeResponse
{
    /// <summary>
    /// Уникальный идентификатор цели.
    /// </summary>
    public Guid Id { get; set; }
    
    /// <summary>
    /// Заголовок цели.
    /// </summary>
    public string Title { get; set; } = string.Empty;
    
    /// <summary>
    /// Описание цели.
    /// </summary>
    public string Description { get; set; } = string.Empty;
    
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
