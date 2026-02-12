namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ с информацией о группе
/// </summary>
public class GroupResponse
{
    /// <summary>
    /// Идентификатор группы
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Заголовок группы
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Описание группы
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Идентификатор области
    /// </summary>
    public Guid AreaId { get; set; }

    /// <summary>
    /// Идентификатор владельца
    /// </summary>
    public Guid OwnerUserId { get; set; }

    /// <summary>
    /// Имя пользователя-владельца.
    /// </summary>
    public string OwnerUserName { get; set; } = string.Empty;

    /// <summary>
    /// Дата создания
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Дата обновления
    /// </summary>
    public DateTimeOffset UpdatedAt { get; set; }

    /// <summary>
    /// Активна ли группа
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Дата деактивации
    /// </summary>
    public DateTimeOffset? DeactivatedAt { get; set; }
}
