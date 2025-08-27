using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Interfaces.Providers;

/// <summary>
/// Интерфейс провайдера для работы с Keycloak API
/// </summary>
public interface IKeycloakProvider
{
    /// <summary>
    /// Получение токенов доступа
    /// </summary>
    /// <param name="username">Имя пользователя</param>
    /// <param name="password">Пароль</param>
    /// <returns>Токены доступа</returns>
    Task<KeycloakTokenResponse> GetTokenAsync(string username, string password);

    /// <summary>
    /// Обновление токена доступа
    /// </summary>
    /// <param name="refreshToken">Refresh токен</param>
    /// <returns>Новые токены доступа</returns>
    Task<KeycloakTokenResponse> RefreshTokenAsync(string refreshToken);

    /// <summary>
    /// Отзыв токена
    /// </summary>
    /// <param name="refreshToken">Refresh токен для отзыва</param>
    /// <returns>Результат отзыва</returns>
    Task<bool> RevokeTokenAsync(string refreshToken);

    /// <summary>
    /// Получение информации о пользователе
    /// </summary>
    /// <param name="accessToken">Access токен</param>
    /// <returns>Информация о пользователе</returns>
    Task<KeycloakUserInfo> GetUserInfoAsync(string accessToken);

    /// <summary>
    /// Создание нового пользователя
    /// </summary>
    /// <param name="request">Данные для создания пользователя</param>
    /// <returns>Идентификатор созданного пользователя</returns>
    Task<string> CreateUserAsync(RegisterRequest request);

    /// <summary>
    /// Проверка валидности токена
    /// </summary>
    /// <param name="accessToken">Access токен</param>
    /// <returns>Результат проверки</returns>
    Task<bool> ValidateTokenAsync(string accessToken);
}

/// <summary>
/// Ответ Keycloak с токенами
/// </summary>
public class KeycloakTokenResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public string TokenType { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
    public int RefreshExpiresIn { get; set; }
    public string Scope { get; set; } = string.Empty;
}

/// <summary>
/// Информация о пользователе от Keycloak
/// </summary>
public class KeycloakUserInfo
{
    public string Sub { get; set; } = string.Empty;
    public string PreferredUsername { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string GivenName { get; set; } = string.Empty;
    public string FamilyName { get; set; } = string.Empty;
    public bool EmailVerified { get; set; }
    public string Name { get; set; } = string.Empty;
}
