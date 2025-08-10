namespace TaskerApi.Models.Entities;

public class TagEntity
{
    public Guid Id { get; set; }
    public Guid AreaId { get; init; }
    public string Slug { get; set; } = string.Empty;
    public string? Label { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset? Deactivated { get; set; }
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset Updated { get; set; }
}
