namespace TaskerApi.Models.Common;

/// <summary>
/// Настройки аутентификации (cookie и т.п.).
/// </summary>
public class AuthSettings
{
    /// <summary>Путь для cookie refresh-токена. По умолчанию /api/auth.</summary>
    public string CookiePath { get; set; } = "/api/auth";

    /// <summary>Имя cookie для refresh-токена. По умолчанию refreshToken.</summary>
    public string RefreshTokenCookieName { get; set; } = "refreshToken";

    /// <summary>Количество итераций PBKDF2 для хеширования пароля. По умолчанию 100000.</summary>
    public int PasswordHasherIterations { get; set; } = 100_000;
}
