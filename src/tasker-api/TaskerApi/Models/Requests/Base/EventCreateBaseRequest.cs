namespace TaskerApi.Models.Requests.Base;

public class EventCreateBaseRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CreatorUserId { get; set; }
}