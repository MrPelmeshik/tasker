namespace TaskerApi.Models.Entities;

public class RelationKindRefEntity
{
    public int Id { get; set; }
    public string Kind { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}
