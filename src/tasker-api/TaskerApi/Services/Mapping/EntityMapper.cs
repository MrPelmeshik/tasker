using TaskerApi.Core;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Models.Common;
using TaskerApi.Services;

namespace TaskerApi.Services.Mapping;

/// <summary>
/// Маппер для преобразования Entity в Response модели
/// </summary>
public static class EntityMapper
{

    /// <summary>
    /// Маппинг AreaEntity в AreaResponse
    /// </summary>
    public static AreaResponse ToAreaResponse(this AreaEntity entity, string ownerUserName = "")
    {
        return new AreaResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            OwnerUserId = entity.OwnerUserId,
            OwnerUserName = ownerUserName,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive,
            DeactivatedAt = entity.DeactivatedAt
        };
    }

    /// <summary>
    /// Маппинг AreaEntity в AreaShortCardResponse
    /// </summary>
    public static AreaShortCardResponse ToAreaShortCardResponse(this AreaEntity entity, int groupsCount = 0, string ownerUserName = "")
    {
        return new AreaShortCardResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            GroupCount = groupsCount,
            OwnerUserId = entity.OwnerUserId,
            OwnerUserName = ownerUserName,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
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
            OwnerUserId = entity.OwnerUserId,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive,
            DeactivatedAt = entity.DeactivatedAt
        };
    }

    /// <summary>
    /// Маппинг GroupEntity в GroupResponse
    /// </summary>
    public static GroupResponse ToGroupResponse(this GroupEntity entity, string ownerUserName = "")
    {
        return new GroupResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            AreaId = entity.AreaId,
            OwnerUserId = entity.OwnerUserId,
            OwnerUserName = ownerUserName,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive,
            DeactivatedAt = entity.DeactivatedAt
        };
    }

    /// <summary>
    /// Маппинг GroupEntity в GroupSummaryResponse
    /// </summary>
    public static GroupSummaryResponse ToGroupSummaryResponse(this GroupEntity entity, int tasksCount = 0, string ownerUserName = "")
    {
        return new GroupSummaryResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            AreaId = entity.AreaId,
            OwnerUserId = entity.OwnerUserId,
            OwnerUserName = ownerUserName,
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
    public static TaskResponse ToTaskResponse(this TaskEntity entity, string ownerUserName = "")
    {
        return new TaskResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            GroupId = entity.GroupId,
            OwnerUserId = entity.OwnerUserId,
            OwnerUserName = ownerUserName,
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
    public static TaskSummaryResponse ToTaskSummaryResponse(this TaskEntity entity, string ownerUserName = "")
    {
        return new TaskSummaryResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            GroupId = entity.GroupId,
            OwnerUserId = entity.OwnerUserId,
            OwnerUserName = ownerUserName,
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
            OwnerUserId = entity.OwnerUserId,
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
            OwnerUserId = entity.OwnerUserId,
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
        System.Text.Json.JsonElement? messageElement = null;
        if (!string.IsNullOrEmpty(entity.Message))
        {
            try
            {
                messageElement = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(entity.Message);
            }
            catch
            {
                // Если JSON невалидный — оставляем null
            }
        }

        return new EventResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Message = messageElement,
            EventType = entity.EventType.ToString(),
            OwnerUserId = entity.OwnerUserId,
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
    public static AreaEntity ToAreaEntity(this AreaCreateRequest request, Guid ownerUserId)
    {
        return new AreaEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            OwnerUserId = ownerUserId,
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
    public static GroupEntity ToGroupEntity(this GroupCreateRequest request, Guid ownerUserId)
    {
        return new GroupEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            AreaId = request.AreaId,
            OwnerUserId = ownerUserId,
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
    public static TaskEntity ToTaskEntity(this TaskCreateRequest request, Guid ownerUserId)
    {
        return new TaskEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Status = ResolveTaskStatusOnCreate(request.Status),
            GroupId = request.GroupId,
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
        entity.GroupId = request.GroupId;
        entity.Status = request.Status;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Маппинг SubtaskCreateRequest в SubtaskEntity
    /// </summary>
    public static SubtaskEntity ToSubtaskEntity(this SubtaskCreateRequest request, Guid ownerUserId)
    {
        return new SubtaskEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Status = Models.Common.TaskStatus.New,
            TaskId = request.TaskId,
            OwnerUserId = ownerUserId,
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
    public static PurposeEntity ToPurposeEntity(this PurposeCreateRequest request, Guid ownerUserId)
    {
        return new PurposeEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            OwnerUserId = ownerUserId,
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
    /// Маппинг UserEntity в UserResponse (без чувствительных данных).
    /// </summary>
    public static UserResponse ToUserResponse(this UserEntity entity)
    {
        var roles = entity.IsAdmin ? new List<string> { "admin", "user" } : new List<string> { "user" };
        return new UserResponse
        {
            Id = entity.Id,
            Username = entity.Name,
            Email = entity.Email,
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            Roles = roles,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive,
            DeactivatedAt = entity.DeactivatedAt
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
    /// Маппинг UserCreateRequest в UserEntity с хешированием пароля.
    /// </summary>
    public static UserEntity ToUserEntity(this UserCreateRequest request)
    {
        var (hash, salt) = PasswordHasher.HashPassword(request.Password);
        return new UserEntity
        {
            Id = Guid.NewGuid(),
            Name = request.Username.Trim(),
            Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim(),
            FirstName = string.IsNullOrWhiteSpace(request.FirstName) ? null : request.FirstName.Trim(),
            LastName = string.IsNullOrWhiteSpace(request.LastName) ? null : request.LastName.Trim(),
            PasswordHash = hash,
            PasswordSalt = salt,
            IsAdmin = request.IsAdmin,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }

    /// <summary>
    /// Частичное обновление UserEntity из UserUpdateRequest.
    /// При передаче Password — пересчитывается хеш. Id берётся из URL, не из request.
    /// </summary>
    public static void UpdateUserEntity(this UserUpdateRequest request, UserEntity entity)
    {
        if (request.Username != null)
            entity.Name = request.Username.Trim();
        if (request.Email != null)
            entity.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        if (request.FirstName != null)
            entity.FirstName = string.IsNullOrWhiteSpace(request.FirstName) ? null : request.FirstName.Trim();
        if (request.LastName != null)
            entity.LastName = string.IsNullOrWhiteSpace(request.LastName) ? null : request.LastName.Trim();
        if (request.Password != null)
        {
            var (hash, salt) = PasswordHasher.HashPassword(request.Password);
            entity.PasswordHash = hash;
            entity.PasswordSalt = salt;
        }
        if (request.IsAdmin.HasValue)
            entity.IsAdmin = request.IsAdmin.Value;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Частичное обновление UserEntity из ProfileUpdateRequest.
    /// Поддерживает Username, Email, FirstName, LastName, Password.
    /// </summary>
    public static void ApplyProfileUpdate(this ProfileUpdateRequest request, UserEntity entity)
    {
        if (request.Username != null)
            entity.Name = request.Username.Trim();
        if (request.Email != null)
            entity.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        if (request.FirstName != null)
            entity.FirstName = string.IsNullOrWhiteSpace(request.FirstName) ? null : request.FirstName.Trim();
        if (request.LastName != null)
            entity.LastName = string.IsNullOrWhiteSpace(request.LastName) ? null : request.LastName.Trim();
        if (!string.IsNullOrEmpty(request.NewPassword))
        {
            var (hash, salt) = PasswordHasher.HashPassword(request.NewPassword);
            entity.PasswordHash = hash;
            entity.PasswordSalt = salt;
        }
        entity.UpdatedAt = DateTimeOffset.UtcNow;
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
    public static AreaEntity ToAreaEntity(this CreateAreaWithGroupRequest request, Guid ownerUserId)
    {
        return new AreaEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            OwnerUserId = ownerUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }

    /// <summary>
    /// Маппинг для создания группы по умолчанию
    /// </summary>
    public static GroupEntity ToDefaultGroupEntity(this AreaEntity area, Guid ownerUserId)
    {
        return new GroupEntity
        {
            Id = Guid.NewGuid(),
            Title = "Default Group",
            Description = "Default group for this area",
            AreaId = area.Id,
            OwnerUserId = ownerUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }

    /// <summary>
    /// Маппинг для создания доступа пользователя к области
    /// </summary>
    /// <param name="area">Область</param>
    /// <param name="userId">Идентификатор пользователя</param>
    /// <param name="grantedByUserId">Идентификатор пользователя, предоставившего доступ</param>
    /// <param name="role">Роль пользователя в области</param>
    public static UserAreaAccessEntity ToUserAreaAccessEntity(this AreaEntity area, Guid userId, Guid grantedByUserId, Models.Common.AreaRole role)
    {
        return new UserAreaAccessEntity
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AreaId = area.Id,
            GrantedByUserId = grantedByUserId,
            Role = role,
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
    public static GroupEntity ToGroupEntity(this CreateGroupWithTaskRequest request, Guid ownerUserId)
    {
        return new GroupEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            AreaId = request.AreaId,
            OwnerUserId = ownerUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }

    /// <summary>
    /// Маппинг для создания задачи по умолчанию
    /// </summary>
    public static TaskEntity ToDefaultTaskEntity(this CreateGroupWithTaskRequest request, Guid groupId, Guid ownerUserId)
    {
        return new TaskEntity
        {
            Id = Guid.NewGuid(),
            Title = request.TaskTitle,
            Description = request.TaskDescription,
            Status = Models.Common.TaskStatus.New,
            GroupId = groupId,
            OwnerUserId = ownerUserId,
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
    public static TaskEntity ToTaskEntity(this CreateTaskWithEventRequest request, Guid ownerUserId)
    {
        return new TaskEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Status = Models.Common.TaskStatus.New,
            GroupId = request.GroupId,
            OwnerUserId = ownerUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }

    /// <summary>
    /// Маппинг CreateTaskWithEventRequest в EventEntity
    /// </summary>
    public static EventEntity ToEventEntity(this CreateTaskWithEventRequest request, Guid ownerUserId)
    {
        var messageJson = EventMessageHelper.BuildActivityMessageJson(request.EventTitle, request.EventDescription);

        return new EventEntity
        {
            Id = Guid.NewGuid(),
            Title = request.EventTitle,
            Message = messageJson,
            EventType = (Models.Common.EventType)Enum.Parse(typeof(Models.Common.EventType), request.EventType),
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
