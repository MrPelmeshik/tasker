namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ на создание события.
/// </summary>
public class EventCreateResponse
{
    /// <summary>
    /// Уникальный идентификатор созданного события.
    /// </summary>
    public Guid Id { get; set; }
}