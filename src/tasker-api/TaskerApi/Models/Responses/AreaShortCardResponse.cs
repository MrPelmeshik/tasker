namespace TaskerApi.Models.Responses;

/// <summary>
/// Краткая информация об области для карточки.
/// </summary>
public class AreaShortCardResponse
{
    /// <summary>
    /// Уникальный идентификатор области.
    /// </summary>
    public Guid Id { get; set; }
    
    /// <summary>
    /// Заголовок области.
    /// </summary>
    public string Title { get; set; } = string.Empty;
    
    /// <summary>
    /// Описание области.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Цвет области (hex).
    /// </summary>
    public string? CustomColor { get; set; }
    
    /// <summary>
    /// Количество корневых папок в области.
    /// </summary>
    public int FoldersCount { get; set; }

    /// <summary>
    /// Количество задач в корне области (без папки).
    /// </summary>
    public int RootTasksCount { get; set; }
    
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
    /// Дата и время последнего обновления.
    /// </summary>
    public DateTimeOffset UpdatedAt { get; set; }
    
    /// <summary>
    /// Флаг активности записи.
    /// </summary>
    public bool IsActive { get; set; }
}
