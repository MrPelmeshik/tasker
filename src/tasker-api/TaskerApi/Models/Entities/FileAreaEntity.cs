namespace TaskerApi.Models.Entities;

public class FileAreaEntity
{
    public Guid Id { get; set; }
    public Guid FileId { get; init; }
    public Guid AreaId { get; init; }
    public DateTimeOffset Created { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset? Deactivated { get; set; }
}
