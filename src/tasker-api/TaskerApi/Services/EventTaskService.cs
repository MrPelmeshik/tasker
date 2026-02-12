using Microsoft.EntityFrameworkCore;
using TaskerApi.Core;
using TaskerApi.Interfaces.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Services.Base;
using TaskerApi.Services.Mapping;
using EventType = TaskerApi.Models.Common.EventType;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для работы с событиями задач
/// </summary>
public class EventTaskService(
    ILogger<EventTaskService> logger,
    ICurrentUserService currentUser,
    IEventRepository eventRepository,
    ITaskRepository taskRepository,
    IGroupRepository groupRepository,
    TaskerDbContext context)
    : BaseService(logger, currentUser), IEventTaskService
{
    /// <inheritdoc />
    public async Task<EventCreateResponse> AddEventAsync(EventCreateEntityRequest item, CancellationToken cancellationToken)
    {
        var task = await taskRepository.GetByIdAsync(item.EntityId, cancellationToken);
        if (task == null)
            throw new InvalidOperationException("Задача не найдена");

        var group = await groupRepository.GetByIdAsync(task.GroupId, cancellationToken);
        if (group == null || !CurrentUser.HasAccessToArea(group.AreaId))
            throw new UnauthorizedAccessException("Доступ к задаче запрещен");

        var now = DateTimeOffset.UtcNow;

        var messageJson = EventMessageHelper.BuildActivityMessageJson(item.Title, item.Description);

        var eventEntity = new EventEntity
        {
            Id = Guid.NewGuid(),
            Title = item.Title,
            Message = messageJson,
            EventType = item.EventType,
            CreatorUserId = CurrentUser.UserId,
            CreatedAt = now,
            UpdatedAt = now,
            IsActive = true
        };

        var createdEvent = await eventRepository.CreateAsync(eventEntity, cancellationToken);

        var link = new EventToTaskEntity
        {
            EventId = createdEvent.Id,
            TaskId = item.EntityId,
            CreatorUserId = CurrentUser.UserId,
            CreatedAt = now,
            UpdatedAt = now,
            IsActive = true
        };
        context.EventToTasks.Add(link);
        await context.SaveChangesAsync(cancellationToken);

        return new EventCreateResponse { Id = createdEvent.Id };
    }

    /// <inheritdoc />
    public Task<EventCreateResponse> AddEventAsync(IUnitOfWork uow, EventCreateEntityRequest item, CancellationToken cancellationToken)
    {
        return AddEventAsync(item, cancellationToken);
    }

    /// <inheritdoc />
    public Task<EventCreateResponse> AddEventCreateEntityAsync(IUnitOfWork uow, Guid entityId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException("Используйте AddEventAsync с EventCreateEntityRequest");
    }

    /// <inheritdoc />
    public Task<EventCreateResponse> AddEventUpdateEntityAsync(IUnitOfWork uow, Guid entityId, string changes, CancellationToken cancellationToken)
    {
        throw new NotImplementedException("Используйте AddEventAsync с EventCreateEntityRequest");
    }

    /// <inheritdoc />
    public Task<EventCreateResponse> AddEventDeleteEntityAsync(IUnitOfWork uow, Guid entityId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException("Используйте AddEventAsync с EventCreateEntityRequest");
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<EventResponse>> GetEventsByTaskIdAsync(Guid taskId, CancellationToken cancellationToken)
    {
        var task = await taskRepository.GetByIdAsync(taskId, cancellationToken);
        if (task == null)
            throw new InvalidOperationException("Задача не найдена");

        var group = await groupRepository.GetByIdAsync(task.GroupId, cancellationToken);
        if (group == null || !CurrentUser.HasAccessToArea(group.AreaId))
            throw new UnauthorizedAccessException("Доступ к задаче запрещен");

        var eventIds = context.EventToTasks
            .Where(l => l.TaskId == taskId && l.IsActive)
            .Select(l => l.EventId);
        var events = await context.Events
            .Where(e => eventIds.Contains(e.Id) && e.IsActive)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(cancellationToken);
        return events.Select(e => e.ToEventResponse()).ToList();
    }
}
