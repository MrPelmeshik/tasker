namespace TaskerApi.Models.Responses;

public class AreaMembershipResponse
{
    public Guid Id { get; set; }
    public Guid AreaId { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty;
    public DateTimeOffset Joined { get; set; }
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset Updated { get; set; }
}

public class AreaMembershipDetailedResponse : AreaMembershipResponse
{
    public string AreaName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
}

public class MembershipCheckResponse
{
    public bool IsMember { get; set; }
    public string? Role { get; set; }
    public DateTimeOffset? Joined { get; set; }
}
