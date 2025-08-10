namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на связывание файла с объектом.
/// </summary>
public class LinkFileRequest
{
    public Guid FileId { get; set; }
    public Guid TargetId { get; set; }
}
