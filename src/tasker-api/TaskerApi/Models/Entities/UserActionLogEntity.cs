namespace TaskerApi.Models.Entities;

public class UserActionLogEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; init; }
    public string Action { get; set; } = string.Empty;
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTimeOffset Created { get; set; }
}


