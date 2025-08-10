namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ с информацией о задаче.
/// </summary>
public class TaskResponse
{
    public Guid Id { get; set; }
    public Guid AreaId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int StatusId { get; set; }
    public int VisibilityId { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset Updated { get; set; }
    public DateTimeOffset? Closed { get; set; }
    public bool IsActive { get; set; }
}
