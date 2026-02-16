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
    [StringLength(10000, ErrorMessage = "Описание области не может быть длиннее 10000 символов")]
    public string? Description { get; set; }

    /// <summary>
    /// Цвет области (hex).
    /// </summary>
    [Required(ErrorMessage = "Выберите цвет области")]
    [StringLength(9, ErrorMessage = "Цвет в формате #rrggbb")]
    public string Color { get; set; } = string.Empty;
}
