using System.ComponentModel.DataAnnotations;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на обновление токена
/// </summary>
public class RefreshTokenRequest
{
    /// <summary>
    /// Refresh токен
    /// </summary>
    [Required(ErrorMessage = "Refresh токен обязателен")]
    public string RefreshToken { get; set; } = string.Empty;
}


