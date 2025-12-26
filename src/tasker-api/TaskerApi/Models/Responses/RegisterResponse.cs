namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ на успешную регистрацию
/// </summary>
public class RegisterResponse
{
    /// <summary>
    /// Идентификатор созданного пользователя
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Сообщение об успешной регистрации
    /// </summary>
    public string Message { get; set; } = "Пользователь успешно зарегистрирован";
}

