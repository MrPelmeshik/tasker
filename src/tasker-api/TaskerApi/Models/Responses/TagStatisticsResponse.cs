namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ со статистикой по тегам.
/// </summary>
public class TagStatisticsResponse
{
    public Guid TagId { get; set; }
    public string TagName { get; set; } = string.Empty;
    public int UsageCount { get; set; }
    public int ActionsCount { get; set; }
    public int TasksCount { get; set; }
}
