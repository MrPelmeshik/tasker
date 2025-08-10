namespace TaskerApi.Models.Responses;

public class RuleResponse
{
    public Guid Id { get; set; }
    public Guid AreaId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Condition { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset Updated { get; set; }
}

public class RuleDetailedResponse : RuleResponse
{
    public string AreaName { get; set; } = string.Empty;
    public int ScopesCount { get; set; }
}
