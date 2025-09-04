using TaskerApi.Interfaces.Entities;

namespace TaskerApi.Models.Entities;

public class UserLogEntity : 
    IDbEntity,
    IIdBaseEntity<int>, 
    ICreatedDateBaseEntity
{
    public int Id { get; set; }
    public Guid? UserId { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string HttpMethod { get; set; } = string.Empty;
    public string Endpoint { get; set; } = string.Empty;
    public string? RequestParams { get; set; }
    public int? ResponseCode { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}