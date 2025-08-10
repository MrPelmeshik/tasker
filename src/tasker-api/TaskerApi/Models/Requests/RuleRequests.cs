namespace TaskerApi.Models.Requests;

public class CreateRuleRequest
{
    public Guid AreaId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = true;
    public string Criteria { get; set; } = "{}";
    public string Action { get; set; } = "{}";
}

public class UpdateRuleRequest
{
    public string Name { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public string Criteria { get; set; } = "{}";
    public string Action { get; set; } = "{}";
}
