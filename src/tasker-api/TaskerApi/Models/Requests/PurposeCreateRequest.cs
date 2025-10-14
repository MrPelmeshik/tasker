namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на создание цели.
/// </summary>
public class PurposeCreateRequest
{
    /// <summary>
    /// Заголовок цели.
    /// </summary>
    public string Title { get; set; } = string.Empty;
    
    /// <summary>
    /// Описание цели.
    /// </summary>
    public string Description { get; set; } = string.Empty;
}
