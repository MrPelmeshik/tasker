namespace TaskerApi.Models.Entities;

public class AreaMembershipEntity
{
    public Guid Id { get; set; }
    public Guid AreaId { get; init; }
    public Guid UserId { get; init; }
    public string Role { get; set; } = string.Empty;
    public DateTimeOffset Joined { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset Updated { get; set; }
}
