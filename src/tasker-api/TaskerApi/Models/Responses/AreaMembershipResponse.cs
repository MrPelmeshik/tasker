namespace TaskerApi.Models.Responses;

public class AreaMembershipResponse
{
    /// <summary>
    /// Идентификатор членства.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Идентификатор области.
    /// </summary>
    public Guid AreaId { get; set; }

    /// <summary>
    /// Идентификатор пользователя.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Роль участника.
    /// </summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Время присоединения.
    /// </summary>
    public DateTimeOffset Joined { get; set; }

    /// <summary>
    /// Признак активности.
    /// </summary>
    public bool IsActive { get; set; }
}
