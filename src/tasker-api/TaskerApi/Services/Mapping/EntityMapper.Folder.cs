using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services.Mapping;

/// <summary>
/// Маппинг для Folder (partial)
/// </summary>
public static partial class EntityMapper
{
    /// <summary>
    /// Маппинг FolderEntity в FolderResponse
    /// </summary>
    public static FolderResponse ToFolderResponse(this FolderEntity entity, string ownerUserName = "")
    {
        return new FolderResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            AreaId = entity.AreaId,
            ParentFolderId = entity.ParentFolderId,
            OwnerUserId = entity.OwnerUserId,
            OwnerUserName = ownerUserName,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive,
            DeactivatedAt = entity.DeactivatedAt
        };
    }

    /// <summary>
    /// Маппинг FolderEntity в FolderSummaryResponse
    /// </summary>
    public static FolderSummaryResponse ToFolderSummaryResponse(this FolderEntity entity, int tasksCount = 0, int subfoldersCount = 0, string ownerUserName = "")
    {
        return new FolderSummaryResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            AreaId = entity.AreaId,
            ParentFolderId = entity.ParentFolderId,
            OwnerUserId = entity.OwnerUserId,
            OwnerUserName = ownerUserName,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive,
            DeactivatedAt = entity.DeactivatedAt,
            TasksCount = tasksCount,
            SubfoldersCount = subfoldersCount
        };
    }

    /// <summary>
    /// Маппинг FolderCreateRequest в FolderEntity
    /// </summary>
    public static FolderEntity ToFolderEntity(this FolderCreateRequest request, Guid ownerUserId)
    {
        return new FolderEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            AreaId = request.AreaId,
            ParentFolderId = request.ParentFolderId,
            OwnerUserId = ownerUserId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }

    /// <summary>
    /// Маппинг FolderUpdateRequest в FolderEntity
    /// </summary>
    public static void UpdateFolderEntity(this FolderUpdateRequest request, FolderEntity entity)
    {
        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.AreaId = request.AreaId;
        entity.ParentFolderId = request.ParentFolderId;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
    }
}
