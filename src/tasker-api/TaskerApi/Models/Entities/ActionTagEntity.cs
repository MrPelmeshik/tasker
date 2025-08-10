namespace TaskerApi.Models.Entities;

public class ActionTagEntity
{
    public Guid Id { get; set; }
    public Guid ActionId { get; init; }
    public Guid TagId { get; init; }
    public DateTimeOffset Created { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset? Deactivated { get; set; }
}
