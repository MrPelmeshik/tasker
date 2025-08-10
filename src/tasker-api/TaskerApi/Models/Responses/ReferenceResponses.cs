namespace TaskerApi.Models.Responses;

public class TaskStatusRefResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class VisibilityRefResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class ActionVerbResponse
{
    public int Id { get; set; }
    public string Verb { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class RelationKindRefResponse
{
    public int Id { get; set; }
    public string Kind { get; set; } = string.Empty;
    public string? Description { get; set; }
}
