namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ с информацией об использовании тега.
/// </summary>
public class TagUsageResponse
{
    public Guid TagId { get; set; }
    public string TagName { get; set; } = string.Empty;
    public int UsageCount { get; set; }
    public DateTimeOffset LastUsed { get; set; }
    public string UsedIn { get; set; } = string.Empty; // "actions", "tasks", etc.
}
