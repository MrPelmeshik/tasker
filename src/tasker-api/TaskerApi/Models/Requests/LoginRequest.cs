using System.ComponentModel.DataAnnotations;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на авторизацию пользователя
/// </summary>
public class LoginRequest
{
    /// <summary>
    /// Имя пользователя или email
    /// </summary>
    [Required(ErrorMessage = "Имя пользователя обязательно")]
    [StringLength(255, ErrorMessage = "Имя пользователя не должно превышать 255 символов")]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Пароль пользователя
    /// </summary>
    [Required(ErrorMessage = "Пароль обязателен")]
    [StringLength(500, ErrorMessage = "Пароль не должен превышать 500 символов")]
    public string Password { get; set; } = string.Empty;
}


