using TaskerApi.Models.Entities;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services.Mapping;

/// <summary>
/// Составные маппинги (Area+Folder, Area+UserAreaAccess и т.д.) (partial)
/// </summary>
public static partial class EntityMapper
{
    /// <summary>
    /// Маппинг для создания доступа пользователя к области
    /// </summary>
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

}
