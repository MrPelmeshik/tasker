namespace TaskerApi.Models.Responses;

/// <summary>
/// Краткая информация о группе с количеством задач.
/// </summary>
public class GroupSummaryResponse
{
    /// <summary>
    /// Уникальный идентификатор группы.
    /// </summary>
    public Guid Id { get; set; }
    
    /// <summary>
    /// Заголовок группы.
    /// </summary>
    public string Title { get; set; } = string.Empty;
    
    /// <summary>
    /// Описание группы.
    /// </summary>
    public string? Description { get; set; }
    
    /// <summary>
    /// Идентификатор области.
    /// </summary>
    public Guid AreaId { get; set; }
    
    /// <summary>
    /// Количество задач в группе.
    /// </summary>
    public int TasksCount { get; set; }
    
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
