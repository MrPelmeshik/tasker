namespace TaskerApi.Models.Responses;

public class FileResponse
{
    public Guid Id { get; set; }
    public Guid AreaId { get; set; }
    public Guid UploadedBy { get; set; }
    public string OriginalName { get; set; } = string.Empty;
    public string StorageUrl { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long ByteSize { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset Updated { get; set; }
}

public class FileDetailedResponse : FileResponse
{
    public string AreaName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public int TasksCount { get; set; }
    public int ActionsCount { get; set; }
}
