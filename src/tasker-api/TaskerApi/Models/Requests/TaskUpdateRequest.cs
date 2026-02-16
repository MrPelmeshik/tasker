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
    [StringLength(10000, ErrorMessage = "Описание задачи не должно превышать 10000 символов")]
    public string? Description { get; set; }

    /// <summary>
    /// ID области
    /// </summary>
    [Required(ErrorMessage = "ID области обязателен")]
    public Guid AreaId { get; set; }

    /// <summary>
    /// ID папки (null = в корне области)
    /// </summary>
    public Guid? FolderId { get; set; }

    /// <summary>
    /// Статус задачи
    /// </summary>
    public TaskStatus Status { get; set; }
}
