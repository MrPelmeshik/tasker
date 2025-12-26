using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Models.Common;

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

    #region Request → Entity Mappers

    /// <summary>
    /// Маппинг AreaCreateRequest в AreaEntity
    /// </summary>
    public static AreaEntity ToAreaEntity(this AreaCreateRequest request, Guid creatorUserId)
    {
        return new AreaEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            CreatorUserId = creatorUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }

    /// <summary>
    /// Маппинг AreaUpdateRequest в AreaEntity
    /// </summary>
    public static void UpdateAreaEntity(this AreaUpdateRequest request, AreaEntity entity)
    {
        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Маппинг GroupCreateRequest в GroupEntity
    /// </summary>
    public static GroupEntity ToGroupEntity(this GroupCreateRequest request, Guid creatorUserId)
    {
        return new GroupEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            AreaId = request.AreaId,
            CreatorUserId = creatorUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }

    /// <summary>
    /// Маппинг GroupUpdateRequest в GroupEntity
    /// </summary>
    public static void UpdateGroupEntity(this GroupUpdateRequest request, GroupEntity entity)
    {
        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Маппинг TaskCreateRequest в TaskEntity
    /// </summary>
    public static TaskEntity ToTaskEntity(this TaskCreateRequest request, Guid creatorUserId)
    {
        return new TaskEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Status = ResolveTaskStatusOnCreate(request.Status),
            GroupId = request.GroupId,
            CreatorUserId = creatorUserId,
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
        entity.Status = request.Status;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Маппинг SubtaskCreateRequest в SubtaskEntity
    /// </summary>
    public static SubtaskEntity ToSubtaskEntity(this SubtaskCreateRequest request, Guid creatorUserId)
    {
        return new SubtaskEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Status = Models.Common.TaskStatus.New,
            TaskId = request.TaskId,
            CreatorUserId = creatorUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }

    /// <summary>
    /// Маппинг SubtaskUpdateRequest в SubtaskEntity
    /// </summary>
    public static void UpdateSubtaskEntity(this SubtaskUpdateRequest request, SubtaskEntity entity)
    {
        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.Status = request.Status;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Маппинг PurposeCreateRequest в PurposeEntity
    /// </summary>
    public static PurposeEntity ToPurposeEntity(this PurposeCreateRequest request, Guid creatorUserId)
    {
        return new PurposeEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            CreatorUserId = creatorUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }

    /// <summary>
    /// Маппинг PurposeUpdateRequest в PurposeEntity
    /// </summary>
    public static void UpdatePurposeEntity(this PurposeUpdateRequest request, PurposeEntity entity)
    {
        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Маппинг UserLogCreateRequest в UserLogEntity
    /// </summary>
    public static UserLogEntity ToUserLogEntity(this UserLogCreateRequest request, Guid userId)
    {
        return new UserLogEntity
        {
            Id = 0, // Auto-generated
            UserId = userId,
            HttpMethod = request.HttpMethod,
            Endpoint = request.Endpoint,
            IpAddress = request.IpAddress,
            UserAgent = request.UserAgent,
            RequestParams = request.RequestParams,
            ResponseCode = request.ResponseCode,
            ErrorMessage = request.ErrorMessage,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    /// <summary>
    /// Маппинг UserEntity в UserInfo
    /// </summary>
    public static UserInfo ToUserInfo(this UserEntity entity)
    {
        return new UserInfo
        {
            Id = entity.Id.ToString(),
            Username = entity.Name,
            Email = entity.Email ?? string.Empty,
            FirstName = entity.FirstName ?? string.Empty,
            LastName = entity.LastName ?? string.Empty,
            Roles = new List<string> { "user" }
        };
    }

    /// <summary>
    /// Маппинг UserEntity в AuthResponse
    /// </summary>
    public static AuthResponse ToAuthResponse(this UserEntity entity, string accessToken, int expiresIn)
    {
        return new AuthResponse
        {
            AccessToken = accessToken,
            ExpiresIn = expiresIn,
            UserInfo = entity.ToUserInfo()
        };
    }

    /// <summary>
    /// Маппинг RegisterRequest в UserEntity
    /// </summary>
    public static UserEntity ToUserEntity(this RegisterRequest request, string passwordHash, string passwordSalt)
    {
        return new UserEntity
        {
            Id = Guid.NewGuid(),
            Name = request.Username.Trim(),
            Email = request.Email.Trim(),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt,
            CreatedAt = DateTimeOffset.Now,
            UpdatedAt = DateTimeOffset.Now,
            IsActive = true
        };
    }

    /// <summary>
    /// Маппинг UserEntity в RegisterResponse
    /// </summary>
    public static RegisterResponse ToRegisterResponse(this UserEntity entity)
    {
        return new RegisterResponse
        {
            UserId = entity.Id.ToString(),
            Message = "Пользователь успешно зарегистрирован"
        };
    }

    /// <summary>
    /// Маппинг RefreshTokenRequest в RefreshTokenResponse
    /// </summary>
    public static RefreshTokenResponse ToRefreshTokenResponse(string accessToken, int expiresIn)
    {
        return new RefreshTokenResponse
        {
            AccessToken = accessToken,
            ExpiresIn = expiresIn,
            TokenType = "Bearer"
        };
    }

    /// <summary>
    /// Маппинг CreateAreaWithGroupRequest в AreaEntity
    /// </summary>
    public static AreaEntity ToAreaEntity(this CreateAreaWithGroupRequest request, Guid creatorUserId)
    {
        return new AreaEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            CreatorUserId = creatorUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }

    /// <summary>
    /// Маппинг для создания группы по умолчанию
    /// </summary>
    public static GroupEntity ToDefaultGroupEntity(this AreaEntity area, Guid creatorUserId)
    {
        return new GroupEntity
        {
            Id = Guid.NewGuid(),
            Title = "Default Group",
            Description = "Default group for this area",
            AreaId = area.Id,
            CreatorUserId = creatorUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }

    /// <summary>
    /// Маппинг для создания доступа пользователя к области
    /// </summary>
    public static UserAreaAccessEntity ToUserAreaAccessEntity(this AreaEntity area, Guid userId, Guid grantedByUserId)
    {
        return new UserAreaAccessEntity
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AreaId = area.Id,
            GrantedByUserId = grantedByUserId,
            GrantedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }

    /// <summary>
    /// Маппинг для создания CreateAreaWithGroupResponse
    /// </summary>
    public static CreateAreaWithGroupResponse ToCreateAreaWithGroupResponse(this AreaEntity area, GroupEntity group)
    {
        return new CreateAreaWithGroupResponse
        {
            Area = area.ToAreaResponse(),
            DefaultGroup = group.ToGroupResponse()
        };
    }

    /// <summary>
    /// Маппинг CreateGroupWithTaskRequest в GroupEntity
    /// </summary>
    public static GroupEntity ToGroupEntity(this CreateGroupWithTaskRequest request, Guid creatorUserId)
    {
        return new GroupEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            AreaId = request.AreaId,
            CreatorUserId = creatorUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }

    /// <summary>
    /// Маппинг для создания задачи по умолчанию
    /// </summary>
    public static TaskEntity ToDefaultTaskEntity(this CreateGroupWithTaskRequest request, Guid groupId, Guid creatorUserId)
    {
        return new TaskEntity
        {
            Id = Guid.NewGuid(),
            Title = request.TaskTitle,
            Description = request.TaskDescription,
            Status = Models.Common.TaskStatus.New,
            GroupId = groupId,
            CreatorUserId = creatorUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }

    /// <summary>
    /// Маппинг для создания GroupWithTaskResponse
    /// </summary>
    public static GroupWithTaskResponse ToGroupWithTaskResponse(this GroupEntity group, TaskEntity task)
    {
        return new GroupWithTaskResponse
        {
            Group = group.ToGroupResponse(),
            DefaultTask = task.ToTaskResponse()
        };
    }

    /// <summary>
    /// Маппинг CreateTaskWithEventRequest в TaskEntity
    /// </summary>
    public static TaskEntity ToTaskEntity(this CreateTaskWithEventRequest request, Guid creatorUserId)
    {
        return new TaskEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Status = Models.Common.TaskStatus.New,
            GroupId = request.GroupId,
            CreatorUserId = creatorUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }

    /// <summary>
    /// Маппинг CreateTaskWithEventRequest в EventEntity
    /// </summary>
    public static EventEntity ToEventEntity(this CreateTaskWithEventRequest request, Guid creatorUserId)
    {
        return new EventEntity
        {
            Id = Guid.NewGuid(),
            Title = request.EventTitle,
            Description = request.EventDescription,
            EventType = (Models.Common.EventType)Enum.Parse(typeof(Models.Common.EventType), request.EventType),
            CreatorUserId = creatorUserId,
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
    /// Если статус в запросе не задан или некорректен, используется статус "Новая".
    /// </summary>
    /// <param name="status">Статус из запроса создания задачи.</param>
    /// <returns>Валидный стартовый статус задачи.</returns>
    private static Models.Common.TaskStatus ResolveTaskStatusOnCreate(Models.Common.TaskStatus status)
    {
        return Enum.IsDefined(typeof(Models.Common.TaskStatus), status)
            ? status
            : Models.Common.TaskStatus.New;
    }

    #endregion
}
