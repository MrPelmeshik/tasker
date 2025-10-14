namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на создание записи лога пользователя.
/// </summary>
public class UserLogCreateRequest
{
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
}
