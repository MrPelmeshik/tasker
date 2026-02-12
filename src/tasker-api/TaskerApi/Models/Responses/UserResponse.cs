namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ с информацией о пользователе (без чувствительных данных).
/// </summary>
public class UserResponse
{
    /// <summary>
    /// Уникальный идентификатор пользователя.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Имя пользователя (логин).
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Email пользователя.
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Имя.
    /// </summary>
    public string? FirstName { get; set; }

    /// <summary>
    /// Фамилия.
    /// </summary>
    public string? LastName { get; set; }

    /// <summary>
    /// Роли пользователя.
    /// </summary>
    public List<string> Roles { get; set; } = new();

    /// <summary>
    /// Дата и время создания.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Дата и время последнего обновления.
    /// </summary>
    public DateTimeOffset UpdatedAt { get; set; }

    /// <summary>
    /// Флаг активности записи.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Дата и время деактивации (мягкое удаление).
    /// </summary>
    public DateTimeOffset? DeactivatedAt { get; set; }
}
