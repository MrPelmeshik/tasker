using TaskerApi.Models.Common;

namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ на успешную авторизацию
/// </summary>
public class AuthResponse
{
    /// <summary>
    /// Access токен
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Refresh токен
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>
    /// Тип токена
    /// </summary>
    public string TokenType { get; set; } = "Bearer";

    /// <summary>
    /// Время истечения токена в секундах
    /// </summary>
    public int ExpiresIn { get; set; }

    /// <summary>
    /// Информация о пользователе
    /// </summary>
    public UserInfo UserInfo { get; set; } = new();
}

