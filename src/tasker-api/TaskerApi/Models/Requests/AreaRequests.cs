using System.ComponentModel.DataAnnotations;

namespace TaskerApi.Models.Requests;

public class CreateAreaRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UpdateAreaRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}


