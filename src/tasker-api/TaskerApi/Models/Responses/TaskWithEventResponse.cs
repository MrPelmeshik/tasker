using TaskerApi.Models.Responses;

namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ с задачей и событием
/// </summary>
public class TaskWithEventResponse
{
    public TaskResponse Task { get; set; } = null!;
    public EventResponse Event { get; set; } = null!;
}
