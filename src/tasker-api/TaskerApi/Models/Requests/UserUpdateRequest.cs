using System.ComponentModel.DataAnnotations;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на обновление пользователя.
/// </summary>
public class UserUpdateRequest
{
    /// <summary>
    /// Имя пользователя (логин).
    /// </summary>
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Имя пользователя должно содержать от 3 до 50 символов")]
    public string? Username { get; set; }

    /// <summary>
    /// Email пользователя.
    /// </summary>
    [EmailAddress(ErrorMessage = "Некорректный формат email")]
    public string? Email { get; set; }

    /// <summary>
    /// Имя.
    /// </summary>
    [StringLength(100, ErrorMessage = "Имя не может превышать 100 символов")]
    public string? FirstName { get; set; }

    /// <summary>
    /// Фамилия.
    /// </summary>
    [StringLength(100, ErrorMessage = "Фамилия не может превышать 100 символов")]
    public string? LastName { get; set; }

    /// <summary>
    /// Новый пароль. Если передан — пароль будет изменён; если null — пароль не меняется.
    /// </summary>
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Пароль должен содержать минимум 8 символов")]
    public string? Password { get; set; }

    /// <summary>
    /// Признак администратора.
    /// </summary>
    public bool? IsAdmin { get; set; }
}
