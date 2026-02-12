using System.Text.Json.Serialization;
using TaskerApi.Models.Common;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на назначение участника области
/// </summary>
public class AddAreaMemberRequest
{
    /// <summary>
    /// Идентификатор пользователя для назначения
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Роль: Administrator, Executor или Observer
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public AreaRole Role { get; set; }
}
