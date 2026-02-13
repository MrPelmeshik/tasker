using System.ComponentModel.DataAnnotations;
using TaskerApi.Models.Common;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на создание события для сущности.
/// </summary>
public class EventCreateEntityRequest
{
    /// <summary>
    /// Идентификатор сущности.
    /// </summary>
    public Guid EntityId { get; set; }
    
    /// <summary>
    /// Заголовок события.
    /// </summary>
    [Required(ErrorMessage = "Заголовок события обязателен")]
    [StringLength(255, ErrorMessage = "Заголовок не должен превышать 255 символов")]
    public string Title { get; set; } = string.Empty;
    
    /// <summary>
    /// Описание события.
    /// </summary>
    [StringLength(2000, ErrorMessage = "Описание не должно превышать 2000 символов")]
    public string? Description { get; set; }
    
    /// <summary>
    /// Тип события.
    /// </summary>
    public EventType EventType { get; set; }

    /// <summary>
    /// Дата события/активности (обязательное, ISO yyyy-MM-dd или полный ISO).
    /// </summary>
    [Required(ErrorMessage = "Дата события обязательна")]
    [RegularExpression(@"^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$", ErrorMessage = "Формат даты: YYYY-MM-DD или полный ISO")]
    public string EventDate { get; set; } = string.Empty;
}