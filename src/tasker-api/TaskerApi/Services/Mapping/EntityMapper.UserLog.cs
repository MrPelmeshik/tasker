using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services.Mapping;

/// <summary>
/// Маппинг для UserLog (partial)
/// </summary>
public static partial class EntityMapper
{
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

    /// <summary>
    /// Маппинг UserLogCreateRequest в UserLogEntity
    /// </summary>
    public static UserLogEntity ToUserLogEntity(this UserLogCreateRequest request, Guid userId)
    {
        return new UserLogEntity
        {
            Id = 0,
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
}
