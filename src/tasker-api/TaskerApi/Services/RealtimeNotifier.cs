using Microsoft.AspNetCore.SignalR;
using TaskerApi.Hubs;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models;
using TaskerApi.Models.Common;

namespace TaskerApi.Services;

/// <summary>
/// Реализация real-time уведомлений через SignalR Hub
/// </summary>
public class RealtimeNotifier(IHubContext<TaskerHub> hubContext, ILogger<RealtimeNotifier> logger) : IRealtimeNotifier
{
    /// <inheritdoc />
    public async Task NotifyEntityChangedAsync(EntityType entityType, Guid entityId, Guid areaId, Guid? folderId, string eventType, CancellationToken cancellationToken = default)
    {
        try
        {
            var payload = new EntityChangedPayload
            {
                EntityType = entityType.ToString(),
                EntityId = entityId,
                AreaId = areaId,
                FolderId = folderId,
                EventType = eventType
            };
            await hubContext.Clients.Group(areaId.ToString()).SendAsync("EntityChanged", payload, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Ошибка отправки EntityChanged: {EntityType} {EntityId}", entityType, entityId);
        }
    }
}
