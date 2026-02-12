using System.Text.Json.Serialization;
using TaskerApi.Models.Common;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на назначение участника области
/// </summary>
public class AddAreaMemberRequest
{
    /// <summary>
    /// Идентификатор пользователя для назначения (альтернатива Email)
    /// </summary>
    public Guid? UserId { get; set; }

    /// <summary>
    /// Почтовый адрес пользователя для назначения (приоритет над UserId, если указаны оба)
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Роль: Administrator, Executor или Observer
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public AreaRole Role { get; set; }
}
