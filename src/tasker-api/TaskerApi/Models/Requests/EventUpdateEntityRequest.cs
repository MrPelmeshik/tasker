using System.ComponentModel.DataAnnotations;
using TaskerApi.Models.Common;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на обновление события (частичное обновление полей).
/// </summary>
public class EventUpdateEntityRequest
{
    /// <summary>
    /// Заголовок события.
    /// </summary>
    [StringLength(255, ErrorMessage = "Заголовок не должен превышать 255 символов")]
    public string? Title { get; set; }

    /// <summary>
    /// Описание события.
    /// </summary>
    [StringLength(10000, ErrorMessage = "Описание не должно превышать 10000 символов")]
    public string? Description { get; set; }

    /// <summary>
    /// Тип события.
    /// </summary>
    public EventType? EventType { get; set; }

    /// <summary>
    /// Дата и время события/активности (ISO yyyy-MM-dd или полный ISO).
    /// </summary>
    [RegularExpression(@"^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$", ErrorMessage = "Формат даты: YYYY-MM-DD или полный ISO")]
    public string? EventDate { get; set; }
}
