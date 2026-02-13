namespace TaskerApi.Models.Responses;

/// <summary>
/// Краткая информация о папке с количеством задач и подпапок
/// </summary>
public class FolderSummaryResponse
{
    /// <summary>
    /// Уникальный идентификатор папки
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Заголовок папки
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Описание папки
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Идентификатор области
    /// </summary>
    public Guid AreaId { get; set; }

    /// <summary>
    /// Идентификатор родительской папки (null = корень области)
    /// </summary>
    public Guid? ParentFolderId { get; set; }

    /// <summary>
    /// Количество задач в папке
    /// </summary>
    public int TasksCount { get; set; }

    /// <summary>
    /// Количество подпапок
    /// </summary>
    public int SubfoldersCount { get; set; }

    /// <summary>
    /// Идентификатор пользователя-владельца
    /// </summary>
    public Guid OwnerUserId { get; set; }

    /// <summary>
    /// Имя пользователя-владельца
    /// </summary>
    public string OwnerUserName { get; set; } = string.Empty;

    /// <summary>
    /// Дата и время создания
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Дата и время последнего обновления
    /// </summary>
    public DateTimeOffset UpdatedAt { get; set; }

    /// <summary>
    /// Флаг активности
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Дата и время деактивации
    /// </summary>
    public DateTimeOffset? DeactivatedAt { get; set; }
}
