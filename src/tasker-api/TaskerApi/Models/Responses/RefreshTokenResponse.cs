namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ на обновление токена
/// </summary>
public class RefreshTokenResponse
{
    /// <summary>
    /// Новый access токен
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Тип токена
    /// </summary>
    public string TokenType { get; set; } = "Bearer";

    /// <summary>
    /// Время истечения токена в секундах
    /// </summary>
    public int ExpiresIn { get; set; }
}

