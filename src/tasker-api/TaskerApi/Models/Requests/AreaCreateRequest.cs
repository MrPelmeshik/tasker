namespace TaskerApi.Models.Requests;

public class AreaCreateRequest
{
    /// <summary>
    /// Заголовок области
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Описание области
    /// </summary>
    public string? Description { get; set; }
}