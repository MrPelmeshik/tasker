using System.ComponentModel.DataAnnotations;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на обновление токена
/// </summary>
public class RefreshTokenRequest
{
    /// <summary>
    /// Refresh токен (опциональный, может быть получен из cookie)
    /// </summary>
    public string? RefreshToken { get; set; }
}


