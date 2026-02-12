using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services.Mapping;

/// <summary>
/// Маппинг для Area (partial)
/// </summary>
public static partial class EntityMapper
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
}
