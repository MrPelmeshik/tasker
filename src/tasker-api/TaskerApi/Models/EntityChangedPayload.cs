using TaskerApi.Models.Common;

namespace TaskerApi.Models;

/// <summary>
/// Payload уведомления об изменении сущности (для SignalR)
/// </summary>
public class EntityChangedPayload
{
    /// <summary>
    /// Тип сущности: Task, Area, Folder, Event
    /// </summary>
    public string EntityType { get; set; } = string.Empty;

    /// <summary>
    /// Идентификатор сущности
    /// </summary>
    public Guid EntityId { get; set; }

    /// <summary>
    /// Идентификатор области
    /// </summary>
    public Guid AreaId { get; set; }

    /// <summary>
    /// Идентификатор папки (если применимо)
    /// </summary>
    public Guid? FolderId { get; set; }

    /// <summary>
    /// Тип события: Create, Update, Delete
    /// </summary>
    public string EventType { get; set; } = string.Empty;
}
