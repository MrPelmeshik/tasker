namespace TaskerApi.Models.Entities;

/// <summary>
/// Действие пользователя (таблица actions).
/// </summary>
public class ActionEntity
{
    /// <summary>
    /// Идентификатор действия.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Идентификатор области.
    /// </summary>
    public Guid AreaId { get; init; }

    /// <summary>
    /// Идентификатор пользователя — автора действия.
    /// </summary>
    public Guid UserId { get; init; }

    /// <summary>
    /// Идентификатор глагола действия (action_verbs).
    /// </summary>
    public int? VerbId { get; set; }

    /// <summary>
    /// Краткое описание действия.
    /// </summary>
    public string? Summary { get; set; }

    /// <summary>
    /// Подробная заметка.
    /// </summary>
    public string? Note { get; set; }

    /// <summary>
    /// Время начала действия.
    /// </summary>
    public DateTimeOffset Started { get; set; }

    /// <summary>
    /// Время завершения действия.
    /// </summary>
    public DateTimeOffset? Ended { get; set; }

    /// <summary>
    /// Длительность в секундах.
    /// </summary>
    public int? DurationSec { get; set; }

    /// <summary>
    /// Идентификатор уровня видимости (visibility_ref).
    /// </summary>
    public int VisibilityId { get; set; }

    /// <summary>
    /// Контекст действия в формате JSON.
    /// </summary>
    public string Context { get; set; } = "{}";

    /// <summary>
    /// Время создания записи.
    /// </summary>
    public DateTimeOffset Created { get; set; }

    /// <summary>
    /// Время последнего обновления записи.
    /// </summary>
    public DateTimeOffset Updated { get; set; }

    /// <summary>
    /// Признак активности записи.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Время деактивации записи (если применимо).
    /// </summary>
    public DateTimeOffset? Deactivated { get; set; }
}
