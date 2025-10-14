namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на создание области.
/// </summary>
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