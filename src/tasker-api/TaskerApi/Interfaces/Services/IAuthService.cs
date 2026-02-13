using TaskerApi.Models.Common;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Interfaces.Services;

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
    Task<(ApiResponse<AuthResponse> response, string refreshToken)> LoginAsync(LoginRequest request);

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
    Task<(ApiResponse<RefreshTokenResponse> response, string refreshToken)> RefreshTokenAsync(RefreshTokenRequest request);


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

    /// <summary>
    /// Обновление профиля текущего пользователя (email, firstName, lastName).
    /// </summary>
    /// <param name="userId">Идентификатор пользователя</param>
    /// <param name="request">Данные для обновления</param>
    /// <returns>Обновлённая информация о пользователе</returns>
    Task<ApiResponse<UserInfo>> UpdateProfileAsync(Guid userId, ProfileUpdateRequest request);

    /// <summary>
    /// Отозвать refresh-токен (инвалидация при logout)
    /// </summary>
    /// <param name="refreshToken">Refresh токен из cookie</param>
    /// <param name="cancellationToken">Токен отмены</param>
    Task RevokeRefreshTokenAsync(string? refreshToken, CancellationToken cancellationToken = default);
}
