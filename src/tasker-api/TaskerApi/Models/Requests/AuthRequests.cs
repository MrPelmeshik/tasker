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
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Пароль пользователя
    /// </summary>
    [Required(ErrorMessage = "Пароль обязателен")]
    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// Запрос на регистрацию нового пользователя
/// </summary>
public class RegisterRequest
{
    /// <summary>
    /// Имя пользователя
    /// </summary>
    [Required(ErrorMessage = "Имя пользователя обязательно")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Имя пользователя должно содержать от 3 до 50 символов")]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Email пользователя
    /// </summary>
    [Required(ErrorMessage = "Email обязателен")]
    [EmailAddress(ErrorMessage = "Некорректный формат email")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Имя
    /// </summary>
    [Required(ErrorMessage = "Имя обязательно")]
    [StringLength(100, ErrorMessage = "Имя не может превышать 100 символов")]
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Фамилия
    /// </summary>
    [Required(ErrorMessage = "Фамилия обязательна")]
    [StringLength(100, ErrorMessage = "Фамилия не может превышать 100 символов")]
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Пароль
    /// </summary>
    [Required(ErrorMessage = "Пароль обязателен")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Пароль должен содержать минимум 8 символов")]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Подтверждение пароля
    /// </summary>
    [Required(ErrorMessage = "Подтверждение пароля обязательно")]
    [Compare("Password", ErrorMessage = "Пароли не совпадают")]
    public string ConfirmPassword { get; set; } = string.Empty;
}

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
