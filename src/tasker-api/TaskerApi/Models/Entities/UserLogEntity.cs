using System.ComponentModel.DataAnnotations.Schema;
using TaskerApi.Interfaces.Models.Entities;

namespace TaskerApi.Models.Entities;

/// <summary>
/// Логирование действий пользователей
/// </summary>
[Table("user_logs")]
public class UserLogEntity :
    IDbEntity,
    IAutoIdBaseEntity<int>,
    ICreatedDateBaseEntity
{
    /// <summary>
    /// Уникальный идентификатор записи лога.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// ID пользователя, совершившего действие
    /// </summary>
    [Column("user_id")]
    public Guid? UserId { get; set; }

    /// <summary>
    /// IP-адрес пользователя
    /// </summary>
    [Column("ip_address")]
    public string? IpAddress { get; set; }

    /// <summary>
    /// User-Agent браузера или клиента
    /// </summary>
    [Column("user_agent")]
    public string? UserAgent { get; set; }

    /// <summary>
    /// HTTP-метод запроса
    /// </summary>
    [Column("http_method")]
    public string HttpMethod { get; set; } = string.Empty;

    /// <summary>
    /// Конечная точка (endpoint) запроса
    /// </summary>
    [Column("endpoint")]
    public string Endpoint { get; set; } = string.Empty;

    /// <summary>
    /// Параметры запроса в формате JSON
    /// </summary>
    [Column("request_params")]
    public object? RequestParams { get; set; }

    /// <summary>
    /// Код ответа сервера
    /// </summary>
    [Column("response_code")]
    public int? ResponseCode { get; set; }

    /// <summary>
    /// Сообщение об ошибке, если есть
    /// </summary>
    [Column("error_message")]
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Дата и время создания записи лога.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }
}