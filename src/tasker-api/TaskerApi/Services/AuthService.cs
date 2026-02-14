using System.Security.Claims;
using Microsoft.Extensions.Options;
using TaskerApi.Constants;
using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Services.Mapping;

namespace TaskerApi.Services;

/// <summary>
/// Сервис аутентификации и авторизации
/// </summary>
public class AuthService(
    ILogger<AuthService> logger,
    IOptions<JwtSettings> jwtOptions,
    IOptions<AuthSettings> authOptions,
    IUserRepository userRepository,
    IRefreshTokenRepository refreshTokenRepository,
    IJwtTokenService jwtTokenService) : IAuthService
{
    private readonly JwtSettings _jwt = jwtOptions.Value;
    private readonly AuthSettings _auth = authOptions.Value;

    /// <summary>
    /// Выполнить вход в систему
    /// </summary>
    /// <param name="request">Данные для входа</param>
    /// <returns>Результат аутентификации и refresh токен</returns>
    public async Task<(ApiResponse<AuthResponse> response, string refreshToken)> LoginAsync(LoginRequest request)
    {
        try
        {
            UserEntity? user;
            var username = request.Username.Trim();
            logger.LogInformation("Попытка входа для имени пользователя/email '{Username}'", username);
            if (username.Contains('@'))
            {
                user = await userRepository.GetByEmailAsync(username, CancellationToken.None);
            }
            else
            {
                user = await userRepository.GetByNameAsync(username, CancellationToken.None);
            }

            if (user == null || string.IsNullOrWhiteSpace(user.PasswordHash) || string.IsNullOrWhiteSpace(user.PasswordSalt))
            {
                if (user == null)
                {
                    logger.LogWarning("Вход не выполнен: пользователь не найден для '{Username}'", username);
                }
                else
                {
                    logger.LogWarning("Вход не выполнен: у пользователя '{UserId}' отсутствуют учетные данные пароля (хэш/соль)", user.Id);
                }
                return (ApiResponse<AuthResponse>.ErrorResult(ErrorMessages.InvalidLoginOrPassword), string.Empty);
            }

            if (!user.IsActive)
            {
                logger.LogWarning("Вход не выполнен: пользователь '{UserId}' деактивирован", user.Id);
                return (ApiResponse<AuthResponse>.ErrorResult(ErrorMessages.AccountBlocked), string.Empty);
            }

            var passwordOk = PasswordHasher.Verify(request.Password, user.PasswordHash, user.PasswordSalt, _auth.PasswordHasherIterations);
            if (!passwordOk)
            {
                logger.LogWarning("Вход не выполнен: не удалось проверить пароль для пользователя '{UserId}'", user.Id);
                return (ApiResponse<AuthResponse>.ErrorResult(ErrorMessages.InvalidLoginOrPassword), string.Empty);
            }

            var tokens = jwtTokenService.CreateTokens(user);
            var tokenHash = jwtTokenService.ComputeRefreshTokenHash(tokens.refreshToken);
            var expiresAt = DateTimeOffset.UtcNow.AddDays(_jwt.RefreshTokenLifetimeDays);
            await refreshTokenRepository.StoreAsync(user.Id, tokenHash, expiresAt, CancellationToken.None);

            var response = user.ToAuthResponse(tokens.accessToken, _jwt.AccessTokenLifetimeMinutes * 60);

            return (ApiResponse<AuthResponse>.SuccessResult(response, SuccessMessages.LoginSuccess), tokens.refreshToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка входа");
            return (ApiResponse<AuthResponse>.ErrorResult(ErrorMessages.InternalError), string.Empty);
        }
    }

    /// <summary>
    /// Зарегистрировать нового пользователя
    /// </summary>
    /// <param name="request">Данные для регистрации</param>
    /// <returns>Результат регистрации</returns>
    public async Task<ApiResponse<RegisterResponse>> RegisterAsync(RegisterRequest request)
    {
        try
        {
            var username = request.Username.Trim();
            var email = request.Email.Trim();

            var existingByName = await userRepository.GetByNameAsync(username, CancellationToken.None);
            if (existingByName != null)
                return ApiResponse<RegisterResponse>.ErrorResult(ErrorMessages.UsernameTaken);

            var existingByEmail = await userRepository.GetByEmailAsync(email, CancellationToken.None);
            if (existingByEmail != null)
                return ApiResponse<RegisterResponse>.ErrorResult(ErrorMessages.EmailInUse);

            var (hash, salt) = PasswordHasher.HashPassword(request.Password, _auth.PasswordHasherIterations);

            var user = request.ToUserEntity(hash, salt);

            var createdUser = await userRepository.CreateAsync(user, CancellationToken.None);

            var response = createdUser.ToRegisterResponse();
            return ApiResponse<RegisterResponse>.SuccessResult(response);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка регистрации");
            return ApiResponse<RegisterResponse>.ErrorResult(ErrorMessages.InternalError);
        }
    }

    /// <summary>
    /// Обновить токен доступа
    /// </summary>
    /// <param name="request">Данные для обновления токена</param>
    /// <returns>Новый токен доступа и refresh токен</returns>
    public async Task<(ApiResponse<RefreshTokenResponse> response, string refreshToken)> RefreshTokenAsync(RefreshTokenRequest request)
    {
        try
        {
            var tokenHash = jwtTokenService.ComputeRefreshTokenHash(request.RefreshToken);
            var isValid = await refreshTokenRepository.IsValidAsync(tokenHash, CancellationToken.None);
            if (!isValid)
            {
                return (ApiResponse<RefreshTokenResponse>.ErrorResult(ErrorMessages.RefreshTokenInvalidOrRevoked), string.Empty);
            }

            var principal = jwtTokenService.ValidateToken(request.RefreshToken, validateLifetime: true, expectedTokenType: TokenTypes.Refresh);
            if (principal == null)
            {
                return (ApiResponse<RefreshTokenResponse>.ErrorResult(ErrorMessages.RefreshTokenInvalid), string.Empty);
            }

            var sub = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var name = principal.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty;
            if (!Guid.TryParse(sub, out var userId))
            {
                return (ApiResponse<RefreshTokenResponse>.ErrorResult(ErrorMessages.RefreshTokenInvalid), string.Empty);
            }

            await refreshTokenRepository.RevokeByTokenHashAsync(tokenHash, CancellationToken.None);

            var user = await userRepository.GetByIdAsync(userId, CancellationToken.None);
            if (user == null)
                return (ApiResponse<RefreshTokenResponse>.ErrorResult(ErrorMessages.UserNotFound), string.Empty);

            var tokens = jwtTokenService.CreateTokens(user);
            var newTokenHash = jwtTokenService.ComputeRefreshTokenHash(tokens.refreshToken);
            var expiresAt = DateTimeOffset.UtcNow.AddDays(_jwt.RefreshTokenLifetimeDays);
            await refreshTokenRepository.StoreAsync(userId, newTokenHash, expiresAt, CancellationToken.None);

            var response = EntityMapper.ToRefreshTokenResponse(tokens.accessToken, _jwt.AccessTokenLifetimeMinutes * 60);
            return (ApiResponse<RefreshTokenResponse>.SuccessResult(response), tokens.refreshToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка обновления refresh токена");
            return (ApiResponse<RefreshTokenResponse>.ErrorResult(ErrorMessages.InternalError), string.Empty);
        }
    }


    /// <summary>
    /// Получить информацию о пользователе по токену
    /// </summary>
    /// <param name="accessToken">Токен доступа</param>
    /// <returns>Информация о пользователе</returns>
    public async Task<ApiResponse<UserInfo>> GetUserInfoAsync(string accessToken)
    {
        try
        {
            var principal = jwtTokenService.ValidateToken(accessToken, validateLifetime: true, expectedTokenType: TokenTypes.Access);
            if (principal == null)
            {
                return ApiResponse<UserInfo>.ErrorResult(ErrorMessages.TokenInvalidOrExpired);
            }

            var sub = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(sub, out var userId))
                return ApiResponse<UserInfo>.ErrorResult(ErrorMessages.TokenInvalid);

            var user = await userRepository.GetByIdAsync(userId, CancellationToken.None);

            if (user == null)
                return ApiResponse<UserInfo>.ErrorResult(ErrorMessages.UserNotFound);
            
            var info = user.ToUserInfo();
            return ApiResponse<UserInfo>.SuccessResult(info);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка получения информации о пользователе");
            return ApiResponse<UserInfo>.ErrorResult(ErrorMessages.InternalError);
        }
    }

    /// <summary>
    /// Проверить валидность токена
    /// </summary>
    /// <param name="accessToken">Токен доступа</param>
    /// <returns>True, если токен валиден</returns>
    public Task<bool> ValidateTokenAsync(string accessToken)
    {
        var principal = jwtTokenService.ValidateToken(accessToken, validateLifetime: true, expectedTokenType: TokenTypes.Access);
        return Task.FromResult(principal != null);
    }

    /// <summary>
    /// Обновить профиль текущего пользователя.
    /// Поддерживает Username, Email, FirstName, LastName и смену пароля.
    /// </summary>
    public async Task<ApiResponse<UserInfo>> UpdateProfileAsync(Guid userId, ProfileUpdateRequest request)
    {
        try
        {
            var user = await userRepository.GetByIdAsync(userId, CancellationToken.None);
            if (user == null)
                return ApiResponse<UserInfo>.ErrorResult(ErrorMessages.UserNotFound);

            if (!string.IsNullOrEmpty(request.Username))
            {
                var newUsername = request.Username.Trim();
                if (newUsername.Length >= 3)
                {
                    var existingByName = await userRepository.GetByNameAsync(newUsername, CancellationToken.None);
                    if (existingByName != null && existingByName.Id != userId)
                        return ApiResponse<UserInfo>.ErrorResult(ErrorMessages.LoginTaken);
                }
            }

            if (request.Email != null)
            {
                var newEmail = request.Email.Trim();
                if (!string.IsNullOrEmpty(newEmail))
                {
                    var existingByEmail = await userRepository.GetByEmailAsync(newEmail, CancellationToken.None);
                    if (existingByEmail != null && existingByEmail.Id != userId)
                        return ApiResponse<UserInfo>.ErrorResult(ErrorMessages.EmailInUse);
                }
            }

            if (!string.IsNullOrEmpty(request.NewPassword))
            {
                if (string.IsNullOrEmpty(request.CurrentPassword))
                    return ApiResponse<UserInfo>.ErrorResult(ErrorMessages.CurrentPasswordRequiredForChange);

                var passwordOk = PasswordHasher.Verify(request.CurrentPassword, user.PasswordHash ?? "", user.PasswordSalt ?? "", _auth.PasswordHasherIterations);
                if (!passwordOk)
                    return ApiResponse<UserInfo>.ErrorResult(ErrorMessages.WrongCurrentPassword);
            }

            request.ApplyProfileUpdate(user);
            await userRepository.UpdateAsync(user, CancellationToken.None);

            var info = user.ToUserInfo();
            return ApiResponse<UserInfo>.SuccessResult(info, SuccessMessages.ProfileUpdated);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка обновления профиля");
            return ApiResponse<UserInfo>.ErrorResult(ErrorMessages.InternalError);
        }
    }

    /// <inheritdoc />
    public async Task RevokeRefreshTokenAsync(string? refreshToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            return;

        try
        {
            var tokenHash = jwtTokenService.ComputeRefreshTokenHash(refreshToken);
            await refreshTokenRepository.RevokeByTokenHashAsync(tokenHash, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Не удалось отозвать refresh-токен");
        }
    }

}
