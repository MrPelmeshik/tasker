namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на связывание действия с задачей.
/// </summary>
public class LinkActionTaskRequest
{
    public Guid ActionId { get; set; }
    public Guid TaskId { get; set; }
    public int RelationKindId { get; set; }
}
