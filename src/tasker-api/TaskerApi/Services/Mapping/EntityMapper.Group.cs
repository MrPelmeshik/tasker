using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services.Mapping;

/// <summary>
/// Маппинг для Group (partial)
/// </summary>
public static partial class EntityMapper
{
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
}
