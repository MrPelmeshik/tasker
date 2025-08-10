namespace TaskerApi.Models.Entities;

public class RuleScopeEntity
{
    public Guid Id { get; set; }
    public Guid RuleId { get; init; }
    public Guid? TaskId { get; set; }
    public DateTimeOffset Created { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset? Deactivated { get; set; }
}
