using TaskerApi.Helpers;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services.Mapping;

/// <summary>
/// Маппинг для Event (partial)
/// </summary>
public static partial class EntityMapper
{
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
            EventDate = entity.EventDate,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive,
            DeactivatedAt = entity.DeactivatedAt
        };
    }

    /// <summary>
    /// Маппинг CreateTaskWithEventRequest в EventEntity
    /// </summary>
    public static EventEntity ToEventEntity(this CreateTaskWithEventRequest request, Guid ownerUserId)
    {
        var messageJson = EventMessageHelper.BuildActivityMessageJson(request.EventTitle, request.EventDescription);

        var now = DateTimeOffset.UtcNow;
        return new EventEntity
        {
            Id = Guid.NewGuid(),
            Title = request.EventTitle,
            Message = messageJson,
            EventType = (Models.Common.EventType)Enum.Parse(typeof(Models.Common.EventType), request.EventType),
            OwnerUserId = ownerUserId,
            CreatedAt = now,
            EventDate = now,
            UpdatedAt = now,
            IsActive = true
        };
    }
}
