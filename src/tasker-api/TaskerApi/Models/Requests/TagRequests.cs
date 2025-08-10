namespace TaskerApi.Models.Requests;

public class CreateTagRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Color { get; set; }
}

public class UpdateTagRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Color { get; set; }
}

public class AssignTagRequest
{
    public Guid TagId { get; set; }
}
