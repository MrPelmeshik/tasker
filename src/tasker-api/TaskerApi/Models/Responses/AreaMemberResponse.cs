using System.Text.Json.Serialization;
using TaskerApi.Models.Common;

namespace TaskerApi.Models.Responses;

/// <summary>
/// Информация об участнике области
/// </summary>
public class AreaMemberResponse
{
    /// <summary>
    /// Идентификатор пользователя
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Имя пользователя
    /// </summary>
    public string UserName { get; set; } = string.Empty;

    /// <summary>
    /// Роль в области
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public AreaRole Role { get; set; }
}
