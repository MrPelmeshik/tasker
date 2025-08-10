namespace TaskerApi.Models.Requests;

public class CreateActionRequest
{
    public Guid AreaId { get; set; }
    public Guid UserId { get; set; }
    public string ActionVerb { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTimeOffset? Started { get; set; }
    public DateTimeOffset? Finished { get; set; }
    public long? SpentSeconds { get; set; }
    public string? Metadata { get; set; }
}

public class UpdateActionRequest
{
    public string ActionVerb { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTimeOffset? Started { get; set; }
    public DateTimeOffset? Finished { get; set; }
    public long? SpentSeconds { get; set; }
    public string? Metadata { get; set; }
}

public class StartActionRequest
{
    public Guid AreaId { get; set; }
    public Guid UserId { get; set; }
    public string ActionVerb { get; set; } = string.Empty;
    public string? Description { get; set; }
}
