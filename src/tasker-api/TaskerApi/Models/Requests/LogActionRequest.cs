namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на логирование действия пользователя.
/// </summary>
public class LogActionRequest
{
    public Guid UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}
