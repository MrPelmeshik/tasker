namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос для создания задачи с событием
/// </summary>
public class CreateTaskWithEventRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid GroupId { get; set; }
    public string EventTitle { get; set; } = string.Empty;
    public string EventDescription { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
}
