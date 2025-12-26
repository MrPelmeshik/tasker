namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ на создание группы
/// </summary>
public class GroupCreateResponse
{
    /// <summary>
    /// Идентификатор созданной группы
    /// </summary>
    public Guid GroupId { get; set; }
}
