namespace TaskerApi.Models.Entities;

public class RuleEntity
{
    public Guid Id { get; set; }
    public Guid AreaId { get; init; }
    public string Name { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public string Criteria { get; set; } = "{}";
    public string Action { get; set; } = "{}";
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset Updated { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset? Deactivated { get; set; }
}
