namespace TaskerApi.Models.Responses;

public class TagResponse
{
    public Guid Id { get; set; }
    public Guid AreaId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Color { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset Updated { get; set; }
}

public class TagDetailedResponse : TagResponse
{
    public string AreaName { get; set; } = string.Empty;
    public int UsageCount { get; set; }
}
