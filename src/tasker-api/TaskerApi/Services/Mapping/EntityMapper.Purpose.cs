using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services.Mapping;

/// <summary>
/// Маппинг для Purpose (partial)
/// </summary>
public static partial class EntityMapper
{
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
}
