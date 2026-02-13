using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using TaskerApi.Interfaces.Services;

namespace TaskerApi.Hubs;

/// <summary>
/// SignalR Hub для real-time уведомлений об изменениях сущностей
/// </summary>
[Authorize]
public class TaskerHub(
    IHubAreaAccessService areaAccessService,
    IConnectionAreaTracker connectionAreaTracker,
    ILogger<TaskerHub> logger)
    : Hub
{
    /// <summary>
    /// Максимальное количество областей для подписки (защита от DoS)
    /// </summary>
    private const int MaxJoinAreasCount = 100;

    /// <summary>
    /// Подписаться на уведомления по списку областей. Клиент вызывает после подключения.
    /// Принимаются только области, к которым пользователь имеет доступ.
    /// При повторном вызове соединение выходит из групп, которых нет в новом списке.
    /// </summary>
    /// <param name="areaIds">Список идентификаторов областей</param>
    public async Task JoinAreas(IEnumerable<Guid> areaIds)
    {
        var userIdClaim = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            logger.LogWarning(
                "JoinAreas: не удалось получить userId из claims для ConnectionId={ConnectionId}",
                Context.ConnectionId);
            return;
        }

        var accessibleIds = await areaAccessService.GetAccessibleAreaIdsAsync(userId, Context.ConnectionAborted);
        var accessibleSet = accessibleIds.ToHashSet();

        var requested = (areaIds ?? Enumerable.Empty<Guid>()).Take(MaxJoinAreasCount + 1).ToList();
        if (requested.Count > MaxJoinAreasCount)
            throw new HubException($"Превышен лимит областей для подписки: максимум {MaxJoinAreasCount}");

        var toJoin = requested.Where(id => accessibleSet.Contains(id)).ToList();
        var toJoinSet = toJoin.ToHashSet();

        var currentAreas = connectionAreaTracker.GetAreas(Context.ConnectionId);

        var toLeave = currentAreas.Where(id => !toJoinSet.Contains(id)).ToList();
        var leaveTasks = toLeave.Select(areaId => Groups.RemoveFromGroupAsync(Context.ConnectionId, areaId.ToString()));
        await Task.WhenAll(leaveTasks);

        var toAdd = toJoin.Where(id => !currentAreas.Contains(id)).ToList();
        var addTasks = toAdd.Select(areaId => Groups.AddToGroupAsync(Context.ConnectionId, areaId.ToString()));
        await Task.WhenAll(addTasks);

        connectionAreaTracker.SetAreas(Context.ConnectionId, toJoin);
    }

    /// <inheritdoc />
    public override Task OnDisconnectedAsync(Exception? exception)
    {
        connectionAreaTracker.RemoveConnection(Context.ConnectionId);
        return base.OnDisconnectedAsync(exception);
    }
}
