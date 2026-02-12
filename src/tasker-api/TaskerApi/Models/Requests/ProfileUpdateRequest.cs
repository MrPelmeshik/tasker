using System.ComponentModel.DataAnnotations;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на обновление профиля текущего пользователя.
/// Поддерживает: Username, Email, FirstName, LastName, смену пароля.
/// </summary>
public class ProfileUpdateRequest
{
    /// <summary>
    /// Логин (имя пользователя). От 3 до 50 символов.
    /// </summary>
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Логин должен содержать от 3 до 50 символов")]
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
    /// Текущий пароль. Обязателен при смене пароля (когда указан NewPassword).
    /// </summary>
    public string? CurrentPassword { get; set; }

    /// <summary>
    /// Новый пароль. Минимум 8 символов. При указании требуется CurrentPassword.
    /// </summary>
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Пароль должен содержать минимум 8 символов")]
    public string? NewPassword { get; set; }
}
