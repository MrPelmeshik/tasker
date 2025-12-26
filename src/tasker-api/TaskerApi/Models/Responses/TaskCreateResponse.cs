namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ на создание задачи
/// </summary>
public class TaskCreateResponse
{
    /// <summary>
    /// Идентификатор созданной задачи
    /// </summary>
    public Guid TaskId { get; set; }
}
