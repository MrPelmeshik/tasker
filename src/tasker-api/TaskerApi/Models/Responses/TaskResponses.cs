namespace TaskerApi.Models.Responses;

public class TaskResponse
{
    public Guid Id { get; set; }
    public Guid AreaId { get; set; }
    public Guid CreatedBy { get; set; }
    public Guid? AssignedTo { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int StatusId { get; set; }
    public int VisibilityId { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset Updated { get; set; }
}

public class TaskDetailedResponse : TaskResponse
{
    public string AreaName { get; set; } = string.Empty;
    public string CreatorName { get; set; } = string.Empty;
    public string CreatorEmail { get; set; } = string.Empty;
    public string? AssigneeName { get; set; }
    public string? AssigneeEmail { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public string VisibilityName { get; set; } = string.Empty;
    public int TagsCount { get; set; }
    public int FilesCount { get; set; }
    public int ActionsCount { get; set; }
}


