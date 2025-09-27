using System.ComponentModel.DataAnnotations;
using TaskerApi.Models.Common;
using TaskStatus = TaskerApi.Models.Common.TaskStatus;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на обновление задачи
/// </summary>
public class TaskUpdateRequest
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

    /// <summary>
    /// Статус задачи
    /// </summary>
    public TaskStatus Status { get; set; }
}
