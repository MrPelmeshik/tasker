namespace TaskerApi.Models.Requests;

public class CreateFileRequest
{
    public string Filename { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long ByteSize { get; set; }
    public string StorageUrl { get; set; } = string.Empty;
}

public class UpdateFileRequest
{
    public string Filename { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long ByteSize { get; set; }
    public string StorageUrl { get; set; } = string.Empty;
}

public class LinkFileRequest
{
    public Guid FileId { get; set; }
}
