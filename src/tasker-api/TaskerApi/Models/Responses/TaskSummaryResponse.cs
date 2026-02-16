namespace TaskerApi.Models.Responses;

/// <summary>
/// Краткая информация о задаче
/// </summary>
public class TaskSummaryResponse
{
    /// <summary>
    /// Идентификатор задачи
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Заголовок задачи
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Описание задачи
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Статус задачи (числовой код: 1–5)
    /// </summary>
    public int Status { get; set; }

    /// <summary>
    /// ID области
    /// </summary>
    public Guid AreaId { get; set; }

    /// <summary>
    /// ID папки (null = в корне области)
    /// </summary>
    public Guid? FolderId { get; set; }

    /// <summary>
    /// ID владельца
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
    /// Признак активности
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Дата деактивации
    /// </summary>
    public DateTimeOffset? DeactivatedAt { get; set; }
}
