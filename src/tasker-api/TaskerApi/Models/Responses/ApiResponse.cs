namespace TaskerApi.Models.Responses;

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

