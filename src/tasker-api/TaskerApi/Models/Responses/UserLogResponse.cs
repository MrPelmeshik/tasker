namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ с информацией о логе пользователя.
/// </summary>
public class UserLogResponse
{
    /// <summary>
    /// Уникальный идентификатор записи лога.
    /// </summary>
    public int Id { get; set; }
    
    /// <summary>
    /// Идентификатор пользователя.
    /// </summary>
    public Guid? UserId { get; set; }
    
    /// <summary>
    /// HTTP-метод запроса.
    /// </summary>
    public string HttpMethod { get; set; } = string.Empty;
    
    /// <summary>
    /// Конечная точка (endpoint) запроса.
    /// </summary>
    public string Endpoint { get; set; } = string.Empty;
    
    /// <summary>
    /// IP-адрес пользователя.
    /// </summary>
    public string? IpAddress { get; set; }
    
    /// <summary>
    /// User-Agent браузера или клиента.
    /// </summary>
    public string? UserAgent { get; set; }
    
    /// <summary>
    /// Параметры запроса в формате JSON.
    /// </summary>
    public object? RequestParams { get; set; }
    
    /// <summary>
    /// Код ответа сервера.
    /// </summary>
    public int? ResponseCode { get; set; }
    
    /// <summary>
    /// Сообщение об ошибке, если есть.
    /// </summary>
    public string? ErrorMessage { get; set; }
    
    /// <summary>
    /// Дата и время создания записи лога.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }
}
