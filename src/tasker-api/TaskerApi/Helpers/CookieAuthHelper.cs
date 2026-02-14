namespace TaskerApi.Helpers;

/// <summary>
/// Вспомогательные методы для настройки cookie аутентификации (refresh-токен).
/// </summary>
public static class CookieAuthHelper
{
    /// <summary>
    /// Создаёт опции cookie для сохранения refresh-токена.
    /// </summary>
    /// <param name="path">Путь cookie (например /api/auth)</param>
    /// <param name="expires">Время истечения</param>
    /// <param name="isSecure">Флаг Secure (true для HTTPS)</param>
    public static CookieOptions CreateRefreshTokenCookieOptions(string path, DateTimeOffset expires, bool isSecure)
    {
        return new CookieOptions
        {
            HttpOnly = true,
            Secure = isSecure,
            SameSite = SameSiteMode.Lax,
            Path = path,
            Expires = expires
        };
    }

    /// <summary>
    /// Создаёт опции cookie для удаления refresh-токена (истёкшая дата).
    /// </summary>
    public static CookieOptions CreateExpiredCookieOptions(string path, bool isSecure)
    {
        return new CookieOptions
        {
            HttpOnly = true,
            Secure = isSecure,
            SameSite = SameSiteMode.Lax,
            Path = path,
            Expires = DateTimeOffset.UnixEpoch
        };
    }
}
