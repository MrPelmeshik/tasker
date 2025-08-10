namespace TaskerApi.Models.Entities;

public class ActionVerbEntity
{
    public int Id { get; set; }
    public string Verb { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}
