namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ с данными действия.
/// </summary>
public class ActionResponse
{
    /// <summary>
    /// Идентификатор действия.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Идентификатор области.
    /// </summary>
    public Guid AreaId { get; set; }

    /// <summary>
    /// Идентификатор пользователя.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Идентификатор глагола действия.
    /// </summary>
    public int? VerbId { get; set; }

    /// <summary>
    /// Краткое описание.
    /// </summary>
    public string? Summary { get; set; }

    /// <summary>
    /// Подробная заметка.
    /// </summary>
    public string? Note { get; set; }

    /// <summary>
    /// Время начала.
    /// </summary>
    public DateTimeOffset Started { get; set; }

    /// <summary>
    /// Время завершения.
    /// </summary>
    public DateTimeOffset? Ended { get; set; }

    /// <summary>
    /// Длительность в секундах.
    /// </summary>
    public int? DurationSec { get; set; }

    /// <summary>
    /// Идентификатор уровня видимости.
    /// </summary>
    public int VisibilityId { get; set; }

    /// <summary>
    /// Контекст действия.
    /// </summary>
    public string Context { get; set; } = string.Empty;

    /// <summary>
    /// Признак активности.
    /// </summary>
    public bool IsActive { get; set; }
}

/// <summary>
/// Расширенный ответ с данными действия и связанными объектами.
/// </summary>
public class ActionDetailedResponse : ActionResponse
{
    /// <summary>
    /// Название области.
    /// </summary>
    public string? AreaName { get; set; }

    /// <summary>
    /// Имя пользователя.
    /// </summary>
    public string? UserDisplayName { get; set; }

    /// <summary>
    /// Глагол действия.
    /// </summary>
    public string? VerbSlug { get; set; }

    /// <summary>
    /// Уровень видимости.
    /// </summary>
    public string? VisibilitySlug { get; set; }

    /// <summary>
    /// Связанные задачи.
    /// </summary>
    public List<ActionTaskInfo> LinkedTasks { get; set; } = new();
}

/// <summary>
/// Информация о связанной задаче.
/// </summary>
public class ActionTaskInfo
{
    /// <summary>
    /// Идентификатор задачи.
    /// </summary>
    public Guid TaskId { get; set; }

    /// <summary>
    /// Заголовок задачи.
    /// </summary>
    public string TaskTitle { get; set; } = string.Empty;

    /// <summary>
    /// Тип связи.
    /// </summary>
    public string RelationSlug { get; set; } = string.Empty;
}
