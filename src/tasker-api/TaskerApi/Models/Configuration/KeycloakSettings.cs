namespace TaskerApi.Models.Configuration;

/// <summary>
/// Настройки подключения и валидации JWT для Keycloak.
/// </summary>
public class KeycloakSettings
{
    /// <summary>
    /// URL-адрес авторитета (realm) Keycloak.
    /// </summary>
    public string Authority { get; init; } = string.Empty;

    /// <summary>
    /// Идентификатор аудитории (aud) токена.
    /// </summary>
    public string Audience { get; init; } = string.Empty;

    /// <summary>
    /// Идентификатор клиента (clientId).
    /// </summary>
    public string ClientId { get; init; } = string.Empty;

    /// <summary>
    /// Секрет клиента (clientSecret).
    /// </summary>
    public string ClientSecret { get; init; } = string.Empty;

    /// <summary>
    /// Требовать HTTPS для метаданных OpenID.
    /// </summary>
    public bool RequireHttpsMetadata { get; init; } = true;

    /// <summary>
    /// Проверять издателя (iss).
    /// </summary>
    public bool ValidateIssuer { get; init; } = true;

    /// <summary>
    /// Проверять аудиторию (aud).
    /// </summary>
    public bool ValidateAudience { get; init; } = true;

    /// <summary>
    /// Проверять срок действия токена.
    /// </summary>
    public bool ValidateLifetime { get; init; } = true;

    /// <summary>
    /// Проверять ключ подписи издателя.
    /// </summary>
    public bool ValidateIssuerSigningKey { get; init; } = true;
}


