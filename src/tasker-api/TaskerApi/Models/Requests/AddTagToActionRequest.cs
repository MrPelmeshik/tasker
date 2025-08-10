namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на добавление тега к действию.
/// </summary>
public class AddTagToActionRequest
{
    public Guid ActionId { get; set; }
    public Guid TagId { get; set; }
}
