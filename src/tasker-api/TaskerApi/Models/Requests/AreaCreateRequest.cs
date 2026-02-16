using System.ComponentModel.DataAnnotations;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на создание области.
/// </summary>
public class AreaCreateRequest
{
    /// <summary>
    /// Заголовок области
    /// </summary>
    [Required(ErrorMessage = "Заголовок области обязателен")]
    [StringLength(255, ErrorMessage = "Заголовок не должен превышать 255 символов")]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Описание области
    /// </summary>
    [StringLength(2000, ErrorMessage = "Описание не должно превышать 2000 символов")]
    public string? Description { get; set; }

    /// <summary>
    /// Цвет области (hex, например #ff0000). Обязателен при создании.
    /// </summary>
    [Required(ErrorMessage = "Выберите цвет области")]
    [StringLength(9, ErrorMessage = "Цвет в формате #rrggbb")]
    public string Color { get; set; } = string.Empty;
}