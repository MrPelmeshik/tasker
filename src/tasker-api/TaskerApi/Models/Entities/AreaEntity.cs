namespace TaskerApi.Models.Entities;

/// <summary>
/// Область задач и действий (таблица areas).
/// </summary>
public class AreaEntity
{
    /// <summary>
    /// Идентификатор области.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Название области.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Описание области.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Идентификатор пользователя — создателя области.
    /// </summary>
    public Guid UserId { get; init; }

    /// <summary>
    /// Признак активности области.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Дата деактивации области (если применимо).
    /// </summary>
    public DateTimeOffset? Deactivated { get; init; }

    /// <summary>
    /// Время создания записи.
    /// </summary>
    public DateTimeOffset Created { get; set; }

    /// <summary>
    /// Время последнего обновления записи.
    /// </summary>
    public DateTimeOffset Updated { get; set; }
}


