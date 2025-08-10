namespace TaskerApi.Models.Entities;

/// <summary>
/// Сущность пользователя (таблица users).
/// </summary>
public class UserEntity
{
    /// <summary>
    /// Идентификатор пользователя.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Провайдер аутентификации (например, keycloak).
    /// </summary>
    public string Idp { get; set; } = "keycloak";

    /// <summary>
    /// Внешний идентификатор пользователя в провайдере SSO.
    /// </summary>
    public string SsoSubject { get; set; } = string.Empty;

    /// <summary>
    /// Тенант/realm пользователя.
    /// </summary>
    public string? Realm { get; set; }

    /// <summary>
    /// Email пользователя.
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Имя для отображения.
    /// </summary>
    public string? DisplayName { get; set; }

    /// <summary>
    /// URL аватара пользователя.
    /// </summary>
    public string? PictureUrl { get; set; }

    /// <summary>
    /// Признак активности пользователя.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Дата деактивации пользователя (если применимо).
    /// </summary>
    public DateTimeOffset? Deactivated { get; set; }

    /// <summary>
    /// Время создания записи.
    /// </summary>
    public DateTimeOffset Created { get; set; }

    /// <summary>
    /// Время последнего обновления записи.
    /// </summary>
    public DateTimeOffset Updated { get; set; }
}


