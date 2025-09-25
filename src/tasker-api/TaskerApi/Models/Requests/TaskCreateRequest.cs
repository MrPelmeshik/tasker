using System.ComponentModel.DataAnnotations;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на создание задачи
/// </summary>
public class TaskCreateRequest
{
    /// <summary>
    /// Заголовок задачи
    /// </summary>
    [Required(ErrorMessage = "Заголовок задачи обязателен")]
    [StringLength(255, ErrorMessage = "Заголовок задачи не должен превышать 255 символов")]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Описание задачи
    /// </summary>
    [StringLength(2000, ErrorMessage = "Описание задачи не должно превышать 2000 символов")]
    public string? Description { get; set; }

    /// <summary>
    /// ID группы
    /// </summary>
    [Required(ErrorMessage = "ID группы обязателен")]
    public Guid GroupId { get; set; }
}
