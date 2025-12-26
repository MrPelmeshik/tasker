namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на обновление цели.
/// </summary>
public class PurposeUpdateRequest
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
