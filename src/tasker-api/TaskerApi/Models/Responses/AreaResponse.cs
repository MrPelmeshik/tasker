namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ с информацией об области.
/// </summary>
public class AreaResponse
{
    /// <summary>
    /// Заголовок области
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Описание области
    /// </summary>
    public string? Description { get; set; }

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
    /// Уникальный идентификатор области.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Дата и время деактивации (мягкое удаление).
    /// </summary>
    public DateTimeOffset? DeactivatedAt { get; set; }

    /// <summary>
    /// Флаг активности записи.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Дата и время последнего обновления.
    /// </summary>
    public DateTimeOffset UpdatedAt { get; set; }
}