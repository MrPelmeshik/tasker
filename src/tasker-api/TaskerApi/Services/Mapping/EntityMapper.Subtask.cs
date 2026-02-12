using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services.Mapping;

/// <summary>
/// Маппинг для Subtask (partial)
/// </summary>
public static partial class EntityMapper
{
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
}
