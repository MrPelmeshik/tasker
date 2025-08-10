namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ с информацией о действии.
/// </summary>
public class ActionResponse
{
    public Guid Id { get; set; }
    public Guid AreaId { get; set; }
    public Guid UserId { get; set; }
    public int? VerbId { get; set; }
    public string? Summary { get; set; }
    public string? Note { get; set; }
    public DateTimeOffset Started { get; set; }
    public DateTimeOffset? Ended { get; set; }
    public int? DurationSec { get; set; }
    public int VisibilityId { get; set; }
    public string Context { get; set; } = string.Empty;
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset Updated { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>
/// Расширенный ответ с данными действия и связанными объектами.
/// </summary>
public class ActionDetailedResponse : ActionResponse
{
    public string AreaName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public int TasksCount { get; set; }
    public int FilesCount { get; set; }
}
