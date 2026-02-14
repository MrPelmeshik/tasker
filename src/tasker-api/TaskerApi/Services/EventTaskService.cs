using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Services.Base;
using TaskerApi.Constants;
using TaskerApi.Services.Mapping;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для работы с событиями задач
/// </summary>
public class EventTaskService(
    ILogger<EventTaskService> logger,
    ICurrentUserService currentUser,
    IEventRepository eventRepository,
    ITaskRepository taskRepository,
    IAreaRoleService areaRoleService,
    IRealtimeNotifier realtimeNotifier,
    TaskerDbContext context)
    : BaseEventEntityService(logger, currentUser, eventRepository, areaRoleService, context), IEventTaskService
{
    /// <inheritdoc />
    public async Task<EventCreateResponse> AddEventAsync(EventCreateEntityRequest item, CancellationToken cancellationToken)
    {
        var result = await AddEventCoreAsync(item, cancellationToken);
        var task = await taskRepository.GetByIdAsync(item.EntityId, cancellationToken);
        if (task != null)
        {
            await realtimeNotifier.NotifyEntityChangedAsync(Models.Common.EntityType.EVENT, item.EntityId, task.AreaId, task.FolderId, RealtimeEventType.Create, cancellationToken);
        }
        return result;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<EventResponse>> GetEventsByTaskIdAsync(Guid taskId, CancellationToken cancellationToken)
    {
        return await GetEventsCoreAsync(taskId, cancellationToken);
    }

    /// <summary>
    /// <inheritdoc />
    /// </summary>
    protected override async Task<Guid> GetAreaIdForEntityAsync(Guid entityId, CancellationToken cancellationToken)
    {
        var task = await taskRepository.GetByIdAsync(entityId, cancellationToken);
        if (task == null)
            throw new InvalidOperationException(ErrorMessages.TaskNotFound);
        return task.AreaId;
    }

    /// <summary>
    /// <inheritdoc />
    /// </summary>
    protected override async Task EnsureAccessToEntityAsync(Guid entityId, CancellationToken cancellationToken)
    {
        var task = await taskRepository.GetByIdAsync(entityId, cancellationToken);
        if (task == null)
            throw new InvalidOperationException(ErrorMessages.TaskNotFound);
        if (!CurrentUser.HasAccessToArea(task.AreaId))
            throw new UnauthorizedAccessException(ErrorMessages.AccessTaskDenied);
    }

    /// <summary>
    /// <inheritdoc />
    /// </summary>
    protected override void AddLinkToContext(EventEntity createdEvent, Guid entityId, DateTimeOffset now)
    {
        var link = new EventToTaskEntity
        {
            EventId = createdEvent.Id,
            TaskId = entityId,
            OwnerUserId = CurrentUser.UserId,
            CreatedAt = now,
            UpdatedAt = now,
            IsActive = true
        };
        context.EventToTasks.Add(link);
    }

    /// <summary>
    /// <inheritdoc />
    /// </summary>
    protected override IQueryable<Guid> GetEventIdsForEntity(Guid entityId)
    {
        return context.EventToTasks
            .Where(l => l.TaskId == entityId && l.IsActive)
            .Select(l => l.EventId);
    }
}
