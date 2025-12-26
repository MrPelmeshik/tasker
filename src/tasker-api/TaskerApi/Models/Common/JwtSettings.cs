namespace TaskerApi.Models.Common;

/// <summary>
/// Настройки JWT токенов.
/// </summary>
public class JwtSettings
{
    /// <summary>
    /// Издатель токена.
    /// </summary>
    public string Issuer { get; set; } = string.Empty;
    
    /// <summary>
    /// Аудитория токена.
    /// </summary>
    public string Audience { get; set; } = string.Empty;
    
    /// <summary>
    /// Секретный ключ для подписи токенов.
    /// </summary>
    public string SecretKey { get; set; } = string.Empty;
    
    /// <summary>
    /// Время жизни access токена в минутах.
    /// </summary>
    public int AccessTokenLifetimeMinutes { get; set; }
    
    /// <summary>
    /// Время жизни refresh токена в днях.
    /// </summary>
    public int RefreshTokenLifetimeDays { get; set; }
}


