using TaskerApi.Models.Common;

namespace TaskerApi.Models.Requests.Base;

public class EventCreateEntityRequest
{
    public Guid EntityId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public EventType EventType { get; set; }
}