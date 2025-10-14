using TaskerApi.Models.Entities;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services.Mapping;

/// <summary>
/// Маппер для преобразования Entity в Response модели
/// </summary>
public static class EntityMapper
{

    /// <summary>
    /// Маппинг AreaEntity в AreaResponse
    /// </summary>
    public static AreaResponse ToAreaResponse(this AreaEntity entity)
    {
        return new AreaResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            CreatorUserId = entity.CreatorUserId,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive,
            DeactivatedAt = entity.DeactivatedAt
        };
    }

    /// <summary>
    /// Маппинг AreaEntity в AreaShortCardResponse
    /// </summary>
    public static AreaShortCardResponse ToAreaShortCardResponse(this AreaEntity entity, int groupsCount = 0)
    {
        return new AreaShortCardResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            GroupCount = groupsCount,
            CreatedAt = entity.CreatedAt,
            IsActive = entity.IsActive
        };
    }

    /// <summary>
    /// Маппинг AreaEntity в AreaCreateResponse
    /// </summary>
    public static AreaCreateResponse ToAreaCreateResponse(this AreaEntity entity)
    {
        return new AreaCreateResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            CreatorUserId = entity.CreatorUserId,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive,
            DeactivatedAt = entity.DeactivatedAt
        };
    }

    /// <summary>
    /// Маппинг GroupEntity в GroupResponse
    /// </summary>
    public static GroupResponse ToGroupResponse(this GroupEntity entity)
    {
        return new GroupResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            AreaId = entity.AreaId,
            CreatorUserId = entity.CreatorUserId,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive,
            DeactivatedAt = entity.DeactivatedAt
        };
    }

    /// <summary>
    /// Маппинг GroupEntity в GroupSummaryResponse
    /// </summary>
    public static GroupSummaryResponse ToGroupSummaryResponse(this GroupEntity entity, int tasksCount = 0)
    {
        return new GroupSummaryResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            AreaId = entity.AreaId,
            CreatorUserId = entity.CreatorUserId,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive,
            DeactivatedAt = entity.DeactivatedAt,
            TasksCount = tasksCount
        };
    }

    /// <summary>
    /// Маппинг TaskEntity в TaskResponse
    /// </summary>
    public static TaskResponse ToTaskResponse(this TaskEntity entity)
    {
        return new TaskResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            GroupId = entity.GroupId,
            CreatorUserId = entity.CreatorUserId,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive,
            DeactivatedAt = entity.DeactivatedAt,
            Status = entity.Status
        };
    }

    /// <summary>
    /// Маппинг TaskEntity в TaskSummaryResponse
    /// </summary>
    public static TaskSummaryResponse ToTaskSummaryResponse(this TaskEntity entity)
    {
        return new TaskSummaryResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            GroupId = entity.GroupId,
            CreatorUserId = entity.CreatorUserId,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive,
            DeactivatedAt = entity.DeactivatedAt,
            Status = entity.Status
        };
    }

    /// <summary>
    /// Маппинг SubtaskEntity в SubtaskResponse
    /// </summary>
    public static SubtaskResponse ToSubtaskResponse(this SubtaskEntity entity)
    {
        return new SubtaskResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            TaskId = entity.TaskId,
            CreatorUserId = entity.CreatorUserId,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive,
            DeactivatedAt = entity.DeactivatedAt,
            Status = entity.Status
        };
    }

    /// <summary>
    /// Маппинг PurposeEntity в PurposeResponse
    /// </summary>
    public static PurposeResponse ToPurposeResponse(this PurposeEntity entity)
    {
        return new PurposeResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            CreatorUserId = entity.CreatorUserId,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive,
            DeactivatedAt = entity.DeactivatedAt
        };
    }

    /// <summary>
    /// Маппинг EventEntity в EventResponse
    /// </summary>
    public static EventResponse ToEventResponse(this EventEntity entity)
    {
        return new EventResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            EventType = entity.EventType.ToString(),
            CreatorUserId = entity.CreatorUserId,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive,
            DeactivatedAt = entity.DeactivatedAt
        };
    }

    /// <summary>
    /// Маппинг UserLogEntity в UserLogResponse
    /// </summary>
    public static UserLogResponse ToUserLogResponse(this UserLogEntity entity)
    {
        return new UserLogResponse
        {
            Id = entity.Id,
            UserId = entity.UserId,
            HttpMethod = entity.HttpMethod,
            Endpoint = entity.Endpoint,
            IpAddress = entity.IpAddress,
            UserAgent = entity.UserAgent,
            RequestParams = entity.RequestParams,
            ResponseCode = entity.ResponseCode,
            ErrorMessage = entity.ErrorMessage,
            CreatedAt = entity.CreatedAt
        };
    }
}
