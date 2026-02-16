using System.Globalization;
using Microsoft.EntityFrameworkCore;
using TaskerApi.Core;
using TaskerApi.Helpers;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Constants;
using TaskerApi.Services.Mapping;

namespace TaskerApi.Services.Base;

/// <summary>
/// Базовый сервис для работы с событиями, связанными с сущностями (задачи, группы, области).
/// </summary>
public abstract class BaseEventEntityService(
    ILogger logger,
    ICurrentUserService currentUser,
    IEventRepository eventRepository,
    IAreaRoleService areaRoleService,
    TaskerDbContext context)
    : BaseService(logger, currentUser)
{
    /// <summary>
    /// Получить идентификатор области для проверки прав на добавление активности.
    /// </summary>
    protected abstract Task<Guid> GetAreaIdForEntityAsync(Guid entityId, CancellationToken cancellationToken);

    /// <summary>
    /// Проверить доступ к сущности для получения событий.
    /// </summary>
    protected abstract Task EnsureAccessToEntityAsync(Guid entityId, CancellationToken cancellationToken);

    /// <summary>
    /// Добавить связь события с сущностью в контекст и сохранить изменения.
    /// </summary>
    protected abstract void AddLinkToContext(EventEntity createdEvent, Guid entityId, DateTimeOffset now);

    /// <summary>
    /// Получить идентификаторы событий, связанных с сущностью.
    /// </summary>
    protected abstract IQueryable<Guid> GetEventIdsForEntity(Guid entityId);

    /// <summary>
    /// Получить идентификатор области по идентификатору события (через связь с задачей или областью).
    /// </summary>
    protected async Task<Guid> GetAreaIdForEventAsync(Guid eventId, CancellationToken cancellationToken)
    {
        var areaIdFromTask = await context.EventToTasks
            .Where(l => l.EventId == eventId && l.IsActive)
            .Join(context.Tasks, l => l.TaskId, t => t.Id, (_, t) => t.AreaId)
            .FirstOrDefaultAsync(cancellationToken);
        if (areaIdFromTask != default)
            return areaIdFromTask;

        var areaIdFromArea = await context.EventToAreas
            .Where(l => l.EventId == eventId && l.IsActive)
            .Select(l => l.AreaId)
            .FirstOrDefaultAsync(cancellationToken);
        if (areaIdFromArea != default)
            return areaIdFromArea;

        throw new InvalidOperationException(ErrorMessages.EventNotFound);
    }

    /// <summary>
    /// Получить контекст события для realtime-уведомления (areaId, entityId, folderId).
    /// </summary>
    protected async Task<(Guid AreaId, Guid EntityId, Guid? FolderId)> GetEventRealtimeContextAsync(Guid eventId, CancellationToken cancellationToken)
    {
        var fromTask = await context.EventToTasks
            .Where(l => l.EventId == eventId && l.IsActive)
            .Join(context.Tasks, l => l.TaskId, t => t.Id, (_, t) => new { t.AreaId, EntityId = t.Id, t.FolderId })
            .FirstOrDefaultAsync(cancellationToken);
        if (fromTask != null)
            return (fromTask.AreaId, fromTask.EntityId, fromTask.FolderId);

        var fromArea = await context.EventToAreas
            .Where(l => l.EventId == eventId && l.IsActive)
            .Select(l => new { l.AreaId, EntityId = l.AreaId })
            .FirstOrDefaultAsync(cancellationToken);
        if (fromArea != null)
            return (fromArea.AreaId, fromArea.EntityId, (Guid?)null);

        throw new InvalidOperationException(ErrorMessages.EventNotFound);
    }

    /// <summary>
    /// Добавить событие к сущности.
    /// </summary>
    protected async Task<EventCreateResponse> AddEventCoreAsync(EventCreateEntityRequest item, CancellationToken cancellationToken)
    {
        var areaId = await GetAreaIdForEntityAsync(item.EntityId, cancellationToken);

        if (!await areaRoleService.CanAddActivityAsync(areaId, cancellationToken))
            throw new UnauthorizedAccessException(ErrorMessages.NoPermissionAddActivity);

        var now = DateTimeOffset.UtcNow;

        if (string.IsNullOrWhiteSpace(item.EventDate))
            throw new ArgumentException(ErrorMessages.EventDateRequired, nameof(item.EventDate));

        DateTimeOffset eventDate;
        if (DateTime.TryParseExact(item.EventDate, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
            eventDate = new DateTimeOffset(DateTime.SpecifyKind(parsed, DateTimeKind.Utc));
        else if (DateTimeOffset.TryParse(item.EventDate, out var parsedOffset))
            eventDate = parsedOffset;
        else
            throw new ArgumentException(ErrorMessages.EventDateFormatInvalid, nameof(item.EventDate));

        var messageJson = EventMessageHelper.BuildActivityMessageJson(item.Title, item.Description);

        var eventEntity = new EventEntity
        {
            Id = Guid.NewGuid(),
            Title = item.Title,
            Message = messageJson,
            EventType = item.EventType,
            OwnerUserId = CurrentUser.UserId,
            CreatedAt = now,
            EventDate = eventDate,
            UpdatedAt = now,
            IsActive = true
        };

        var createdEvent = await eventRepository.CreateAsync(eventEntity, cancellationToken);

        AddLinkToContext(createdEvent, item.EntityId, now);

        await context.SaveChangesAsync(cancellationToken);

        return new EventCreateResponse { Id = createdEvent.Id };
    }

    /// <summary>
    /// Получить события по идентификатору сущности.
    /// </summary>
    protected async Task<IReadOnlyList<EventResponse>> GetEventsCoreAsync(Guid entityId, CancellationToken cancellationToken)
    {
        await EnsureAccessToEntityAsync(entityId, cancellationToken);

        var eventIds = GetEventIdsForEntity(entityId);

        var events = await context.Events
            .AsNoTracking()
            .Where(e => eventIds.Contains(e.Id) && e.IsActive)
            .OrderByDescending(e => e.CreatedAt)
            .Join(context.Users, 
                e => e.OwnerUserId, 
                u => u.Id, 
                (e, u) => new { Event = e, UserName = u.Name })
            .ToListAsync(cancellationToken);

        return events.Select(x => x.Event.ToEventResponse(x.UserName ?? "")).ToList();
    }

    /// <summary>
    /// Обновить событие (частичное обновление). Автором записи становится текущий пользователь.
    /// </summary>
    protected async Task UpdateEventCoreAsync(Guid eventId, EventUpdateEntityRequest request, CancellationToken cancellationToken)
    {
        var ev = await eventRepository.GetByIdAsync(eventId, cancellationToken);
        if (ev == null || !ev.IsActive)
            throw new InvalidOperationException(ErrorMessages.EventNotFound);

        var areaId = await GetAreaIdForEventAsync(eventId, cancellationToken);
        if (!await areaRoleService.CanAddActivityAsync(areaId, cancellationToken))
            throw new UnauthorizedAccessException(ErrorMessages.NoPermissionAddActivity);

        var now = DateTimeOffset.UtcNow;

        if (request.Title != null)
            ev.Title = request.Title;

        if (request.Description != null)
            ev.Message = EventMessageHelper.BuildActivityMessageJson(ev.Title, request.Description);

        if (request.EventType.HasValue)
            ev.EventType = request.EventType.Value;

        if (request.EventDate != null)
        {
            if (DateTime.TryParseExact(request.EventDate, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
                ev.EventDate = new DateTimeOffset(DateTime.SpecifyKind(parsed, DateTimeKind.Utc));
            else if (DateTimeOffset.TryParse(request.EventDate, out var parsedOffset))
                ev.EventDate = parsedOffset;
            else
                throw new ArgumentException(ErrorMessages.EventDateFormatInvalid, nameof(request.EventDate));
        }

        ev.UpdatedAt = now;
        ev.OwnerUserId = CurrentUser.UserId;

        await eventRepository.UpdateAsync(ev, cancellationToken);
    }

    /// <summary>
    /// Мягкое удаление события.
    /// </summary>
    protected async Task DeleteEventCoreAsync(Guid eventId, CancellationToken cancellationToken)
    {
        var ev = await eventRepository.GetByIdAsync(eventId, cancellationToken);
        if (ev == null || !ev.IsActive)
            throw new InvalidOperationException(ErrorMessages.EventNotFound);

        var areaId = await GetAreaIdForEventAsync(eventId, cancellationToken);
        if (!await areaRoleService.CanAddActivityAsync(areaId, cancellationToken))
            throw new UnauthorizedAccessException(ErrorMessages.NoPermissionAddActivity);

        await eventRepository.DeleteAsync(eventId, cancellationToken, hardDelete: false);
    }
}
