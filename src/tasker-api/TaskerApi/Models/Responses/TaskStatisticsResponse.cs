namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ со статистикой по задаче.
/// </summary>
public class TaskStatisticsResponse
{
    public Guid TaskId { get; set; }
    public int ActionsCount { get; set; }
    public int TotalDurationSec { get; set; }
    public int CompletedActionsCount { get; set; }
}
