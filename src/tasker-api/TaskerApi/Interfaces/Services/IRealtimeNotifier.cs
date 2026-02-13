using TaskerApi.Models.Common;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Сервис уведомлений об изменениях сущностей в реальном времени (SignalR)
/// </summary>
public interface IRealtimeNotifier
{
    /// <summary>
    /// Уведомить подписчиков области об изменении сущности
    /// </summary>
    /// <param name="entityType">Тип сущности (Task, Area, Folder, Event)</param>
    /// <param name="entityId">Идентификатор сущности</param>
    /// <param name="areaId">Идентификатор области (для группировки подписчиков)</param>
    /// <param name="folderId">Идентификатор папки (если применимо)</param>
    /// <param name="eventType">Тип события: Create, Update, Delete</param>
    /// <param name="cancellationToken">Токен отмены</param>
    Task NotifyEntityChangedAsync(EntityType entityType, Guid entityId, Guid areaId, Guid? folderId, string eventType, CancellationToken cancellationToken = default);
}
