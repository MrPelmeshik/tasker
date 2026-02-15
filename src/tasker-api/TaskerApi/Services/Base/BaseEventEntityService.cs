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
}
