using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services.Mapping;

/// <summary>
/// Маппинг для Task (partial)
/// </summary>
public static partial class EntityMapper
{
    /// <summary>
    /// Маппинг TaskEntity в TaskResponse
    /// </summary>
    public static TaskResponse ToTaskResponse(this TaskEntity entity, string ownerUserName = "")
    {
        return new TaskResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            AreaId = entity.AreaId,
            FolderId = entity.FolderId,
            OwnerUserId = entity.OwnerUserId,
            OwnerUserName = ownerUserName,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive,
            DeactivatedAt = entity.DeactivatedAt,
            Status = (int)entity.Status
        };
    }

    /// <summary>
    /// Маппинг TaskEntity в TaskSummaryResponse
    /// </summary>
    public static TaskSummaryResponse ToTaskSummaryResponse(this TaskEntity entity, string ownerUserName = "")
    {
        return new TaskSummaryResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            AreaId = entity.AreaId,
            FolderId = entity.FolderId,
            OwnerUserId = entity.OwnerUserId,
            OwnerUserName = ownerUserName,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive,
            DeactivatedAt = entity.DeactivatedAt,
            Status = (int)entity.Status
        };
    }

    /// <summary>
    /// Маппинг TaskCreateRequest в TaskEntity
    /// </summary>
    public static TaskEntity ToTaskEntity(this TaskCreateRequest request, Guid ownerUserId)
    {
        return new TaskEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Status = ResolveTaskStatusOnCreate(request.Status),
            AreaId = request.AreaId,
            FolderId = request.FolderId,
            OwnerUserId = ownerUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }

    /// <summary>
    /// Маппинг TaskUpdateRequest в TaskEntity
    /// </summary>
    public static void UpdateTaskEntity(this TaskUpdateRequest request, TaskEntity entity)
    {
        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.AreaId = request.AreaId;
        entity.FolderId = request.FolderId;
        entity.Status = request.Status;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Маппинг CreateTaskWithEventRequest в TaskEntity
    /// </summary>
    public static TaskEntity ToTaskEntity(this CreateTaskWithEventRequest request, Guid ownerUserId)
    {
        return new TaskEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Status = Models.Common.TaskStatus.New,
            AreaId = request.AreaId,
            FolderId = request.FolderId,
            OwnerUserId = ownerUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }

    /// <summary>
    /// Маппинг для создания TaskWithEventResponse
    /// </summary>
    public static TaskWithEventResponse ToTaskWithEventResponse(this TaskEntity task, EventEntity eventEntity)
    {
        return new TaskWithEventResponse
        {
            Task = task.ToTaskResponse(),
            Event = eventEntity.ToEventResponse()
        };
    }

    /// <summary>
    /// Нормализует статус при создании задачи.
    /// </summary>
    private static Models.Common.TaskStatus ResolveTaskStatusOnCreate(Models.Common.TaskStatus status)
    {
        return Enum.IsDefined(typeof(Models.Common.TaskStatus), status)
            ? status
            : Models.Common.TaskStatus.New;
    }
}
