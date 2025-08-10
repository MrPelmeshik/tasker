namespace TaskerApi.Models.Entities;

public class FileActionEntity
{
    public Guid Id { get; set; }
    public Guid FileId { get; init; }
    public Guid ActionId { get; init; }
    public DateTimeOffset Created { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset? Deactivated { get; set; }
}
