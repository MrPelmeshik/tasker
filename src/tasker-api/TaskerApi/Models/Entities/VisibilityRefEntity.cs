namespace TaskerApi.Models.Entities;

/// <summary>
/// Справочник видимости (таблица visibility_ref).
/// </summary>
public class VisibilityRefEntity
{
    /// <summary>
    /// Идентификатор уровня видимости.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Машиночитаемый код уровня видимости.
    /// </summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>
    /// Читаемая метка уровня видимости.
    /// </summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>
    /// Признак активности записи.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Дата деактивации (если применимо).
    /// </summary>
    public DateTimeOffset? Deactivated { get; set; }

    /// <summary>
    /// Время создания записи.
    /// </summary>
    public DateTimeOffset Created { get; set; }

    /// <summary>
    /// Время последнего обновления записи.
    /// </summary>
    public DateTimeOffset Updated { get; set; }
}


