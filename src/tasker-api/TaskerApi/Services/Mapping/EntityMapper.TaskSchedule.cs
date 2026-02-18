using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services.Mapping;

/// <summary>
/// Маппинг для TaskSchedule (partial)
/// </summary>
public static partial class EntityMapper
{
    /// <summary>
    /// Маппинг TaskScheduleEntity в TaskScheduleResponse
    /// </summary>
    public static TaskScheduleResponse ToTaskScheduleResponse(this TaskScheduleEntity entity, string taskTitle = "", Guid? areaId = null, string? areaColor = null, int taskStatus = 0)
    {
        return new TaskScheduleResponse
        {
            Id = entity.Id,
            TaskId = entity.TaskId,
            TaskTitle = taskTitle,
            AreaId = areaId ?? Guid.Empty,
            AreaColor = areaColor,
            TaskStatus = taskStatus,
            StartAt = entity.StartAt,
            EndAt = entity.EndAt,
            CreatedAt = entity.CreatedAt
        };
    }

    /// <summary>
    /// Маппинг TaskScheduleCreateRequest в TaskScheduleEntity
    /// </summary>
    public static TaskScheduleEntity ToTaskScheduleEntity(this TaskScheduleCreateRequest request, Guid ownerUserId)
    {
        return new TaskScheduleEntity
        {
            Id = Guid.NewGuid(),
            TaskId = request.TaskId,
            StartAt = request.StartAt,
            EndAt = request.EndAt,
            OwnerUserId = ownerUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }
}
