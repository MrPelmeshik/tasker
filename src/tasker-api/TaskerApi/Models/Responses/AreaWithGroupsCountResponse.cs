namespace TaskerApi.Models.Responses;

public class AreaShortCardResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int GroupsCount { get; set; }
}
