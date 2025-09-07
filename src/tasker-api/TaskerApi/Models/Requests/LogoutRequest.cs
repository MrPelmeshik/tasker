using System.ComponentModel.DataAnnotations;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на выход из системы
/// </summary>
public class LogoutRequest
{
    /// <summary>
    /// Refresh токен для отзыва
    /// </summary>
    [Required(ErrorMessage = "Refresh токен обязателен")]
    public string RefreshToken { get; set; } = string.Empty;
}


