using System.ComponentModel.DataAnnotations;

namespace TaskerApi.Models.Requests;

public class CreateTaskRequest
{
    public Guid AreaId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int StatusId { get; set; }
    public int VisibilityId { get; set; }
    public DateTimeOffset? DueDate { get; set; }
}

public class UpdateTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int StatusId { get; set; }
    public int VisibilityId { get; set; }
    public DateTimeOffset? DueDate { get; set; }
}


