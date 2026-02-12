using System.Text.Json.Serialization;
using TaskerApi.Models.Common;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на назначение участника области
/// </summary>
public class AddAreaMemberRequest
{
    /// <summary>
    /// Идентификатор пользователя для назначения (альтернатива Login)
    /// </summary>
    public Guid? UserId { get; set; }

    /// <summary>
    /// Логин пользователя для назначения (приоритет над UserId, если указаны оба)
    /// </summary>
    public string? Login { get; set; }

    /// <summary>
    /// Роль: Administrator, Executor или Observer
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public AreaRole Role { get; set; }
}
