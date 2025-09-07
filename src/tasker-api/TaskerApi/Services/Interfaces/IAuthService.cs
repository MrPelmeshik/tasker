using TaskerApi.Models.Common;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services.Interfaces;

/// <summary>
/// Интерфейс сервиса авторизации
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Авторизация пользователя
    /// </summary>
    /// <param name="request">Данные для авторизации</param>
    /// <returns>Токены доступа и информация о пользователе</returns>
    Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request);

    /// <summary>
    /// Регистрация нового пользователя
    /// </summary>
    /// <param name="request">Данные для регистрации</param>
    /// <returns>Результат регистрации</returns>
    Task<ApiResponse<RegisterResponse>> RegisterAsync(RegisterRequest request);

    /// <summary>
    /// Обновление токена доступа
    /// </summary>
    /// <param name="request">Refresh токен</param>
    /// <returns>Новые токены доступа</returns>
    Task<ApiResponse<RefreshTokenResponse>> RefreshTokenAsync(RefreshTokenRequest request);

    /// <summary>
    /// Выход из системы
    /// </summary>
    /// <param name="request">Refresh токен для отзыва</param>
    /// <returns>Результат выхода</returns>
    Task<ApiResponse<object>> LogoutAsync(LogoutRequest request);

    /// <summary>
    /// Получение информации о текущем пользователе
    /// </summary>
    /// <param name="accessToken">Access токен</param>
    /// <returns>Информация о пользователе</returns>
    Task<ApiResponse<UserInfo>> GetUserInfoAsync(string accessToken);

    /// <summary>
    /// Проверка валидности токена
    /// </summary>
    /// <param name="accessToken">Access токен</param>
    /// <returns>Результат проверки</returns>
    Task<bool> ValidateTokenAsync(string accessToken);
}
