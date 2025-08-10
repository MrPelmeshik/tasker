namespace TaskerApi.Models.Entities;

public class FileEntity
{
    public Guid Id { get; set; }
    public string Filename { get; set; } = string.Empty;
    public string? MimeType { get; set; }
    public long? ByteSize { get; set; }
    public string StorageUrl { get; set; } = string.Empty;
    public Guid? UserId { get; set; }
    public DateTimeOffset Created { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset? Deactivated { get; set; }
}
