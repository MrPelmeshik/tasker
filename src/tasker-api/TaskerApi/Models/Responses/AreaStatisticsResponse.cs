namespace TaskerApi.Models.Responses;

public class AreaStatisticsResponse
{
    public Guid AreaId { get; set; }
    public string AreaName { get; set; } = string.Empty;
    public int TotalTasks { get; set; }
    public int ActiveTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int TotalMembers { get; set; }
    public int TotalActions { get; set; }
    public DateTimeOffset LastActivity { get; set; }
    public double CompletionRate => TotalTasks > 0 ? (double)CompletedTasks / TotalTasks * 100 : 0;
}
