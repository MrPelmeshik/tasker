namespace TaskerApi.Models.Responses;

public class AreaResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset Updated { get; set; }
}

public class AreaDetailedResponse : AreaResponse
{
    public string CreatorName { get; set; } = string.Empty;
    public string CreatorEmail { get; set; } = string.Empty;
    public int MembersCount { get; set; }
    public int TasksCount { get; set; }
    public int FilesCount { get; set; }
    public int RulesCount { get; set; }
}


