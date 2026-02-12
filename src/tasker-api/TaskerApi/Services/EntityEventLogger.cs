using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Services;

/// <summary>
/// Реализация автоматического логирования событий при создании, обновлении и удалении сущностей Area, Group, Task.
/// Ошибки логирования не пробрасываются (fail-safe), чтобы не нарушать основную операцию.
/// </summary>
public class EntityEventLogger(
    ILogger<EntityEventLogger> logger,
    ICurrentUserService currentUser,
    IEventRepository eventRepository,
    TaskerDbContext context)
    : IEntityEventLogger
{
    /// <inheritdoc />
    public async Task LogAsync(
        EntityType entityType,
        Guid entityId,
        EventType eventType,
        string title,
        string? messageJson,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var now = DateTimeOffset.UtcNow;
            var userId = currentUser.UserId;

            var eventEntity = new EventEntity
            {
                Id = Guid.NewGuid(),
                Title = title ?? string.Empty,
                Message = messageJson,
                EventType = eventType,
                CreatorUserId = userId,
                CreatedAt = now,
                UpdatedAt = now,
                IsActive = true
            };

            await eventRepository.CreateAsync(eventEntity, cancellationToken);

            switch (entityType)
            {
                case EntityType.AREA:
                    context.EventToAreas.Add(new EventToAreaEntity
                    {
                        EventId = eventEntity.Id,
                        AreaId = entityId,
                        CreatorUserId = userId,
                        CreatedAt = now,
                        UpdatedAt = now,
                        IsActive = true
                    });
                    break;
                case EntityType.GROUP:
                    context.EventToGroups.Add(new EventToGroupEntity
                    {
                        EventId = eventEntity.Id,
                        GroupId = entityId,
                        CreatorUserId = userId,
                        CreatedAt = now,
                        UpdatedAt = now,
                        IsActive = true
                    });
                    break;
                case EntityType.TASK:
                    context.EventToTasks.Add(new EventToTaskEntity
                    {
                        EventId = eventEntity.Id,
                        TaskId = entityId,
                        CreatorUserId = userId,
                        CreatedAt = now,
                        UpdatedAt = now,
                        IsActive = true
                    });
                    break;
                default:
                    logger.LogWarning("Неизвестный тип сущности для логирования события: {EntityType}", entityType);
                    return;
            }

            await context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex,
                "Ошибка автоматического логирования события: EntityType={EntityType}, EntityId={EntityId}, EventType={EventType}",
                entityType, entityId, eventType);
        }
    }
}
