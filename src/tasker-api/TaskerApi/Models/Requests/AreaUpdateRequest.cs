using System.ComponentModel.DataAnnotations;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на обновление области
/// </summary>
public class AreaUpdateRequest
{
    /// <summary>
    /// Заголовок области
    /// </summary>
    [Required(ErrorMessage = "Заголовок области обязателен")]
    [StringLength(255, ErrorMessage = "Заголовок области не может быть длиннее 255 символов")]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Описание области
    /// </summary>
    [StringLength(1000, ErrorMessage = "Описание области не может быть длиннее 1000 символов")]
    public string? Description { get; set; }
}
