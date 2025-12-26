namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос для создания группы с задачей по умолчанию
/// </summary>
public class CreateGroupWithTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid AreaId { get; set; }
    public string TaskTitle { get; set; } = string.Empty;
    public string TaskDescription { get; set; } = string.Empty;
}
