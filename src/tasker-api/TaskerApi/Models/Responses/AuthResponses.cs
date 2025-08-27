namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ на успешную авторизацию
/// </summary>
public class AuthResponse
{
    /// <summary>
    /// Access токен
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Refresh токен
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>
    /// Тип токена
    /// </summary>
    public string TokenType { get; set; } = "Bearer";

    /// <summary>
    /// Время истечения токена в секундах
    /// </summary>
    public int ExpiresIn { get; set; }

    /// <summary>
    /// Информация о пользователе
    /// </summary>
    public UserInfo UserInfo { get; set; } = new();
}

/// <summary>
/// Информация о пользователе
/// </summary>
public class UserInfo
{
    /// <summary>
    /// Идентификатор пользователя
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Имя пользователя
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Email пользователя
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Имя
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Фамилия
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Роли пользователя
    /// </summary>
    public List<string> Roles { get; set; } = new();
}

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

/// <summary>
/// Ответ на обновление токена
/// </summary>
public class RefreshTokenResponse
{
    /// <summary>
    /// Новый access токен
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Новый refresh токен
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>
    /// Тип токена
    /// </summary>
    public string TokenType { get; set; } = "Bearer";

    /// <summary>
    /// Время истечения токена в секундах
    /// </summary>
    public int ExpiresIn { get; set; }
}

/// <summary>
/// Общий ответ API
/// </summary>
public class ApiResponse<T>
{
    /// <summary>
    /// Успешность операции
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Сообщение
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Данные ответа
    /// </summary>
    public T? Data { get; set; }

    /// <summary>
    /// Список ошибок
    /// </summary>
    public List<string> Errors { get; set; } = new();

    /// <summary>
    /// Создает успешный ответ
    /// </summary>
    public static ApiResponse<T> SuccessResult(T data, string message = "Операция выполнена успешно")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data
        };
    }

    /// <summary>
    /// Создает ответ с ошибкой
    /// </summary>
    public static ApiResponse<T> ErrorResult(string message, List<string>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Errors = errors ?? new List<string>()
        };
    }
}
