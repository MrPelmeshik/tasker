using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using TaskerApi.Core;
using TaskerApi.Interfaces.Core;
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
    IUserRepository userRepository) : IAuthService
{
    private readonly JwtSettings _jwt = ValidateJwtSettings(jwtOptions.Value);

    private static JwtSettings ValidateJwtSettings(JwtSettings jwt)
    {
        if (string.IsNullOrEmpty(jwt.SecretKey))
            throw new InvalidOperationException("JWT SecretKey не настроен. Пожалуйста, установите переменную окружения JWT_SECRET_KEY.");
        if (string.IsNullOrEmpty(jwt.Issuer))
            throw new InvalidOperationException("JWT Issuer не настроен. Пожалуйста, установите переменную окружения JWT_ISSUER.");
        if (string.IsNullOrEmpty(jwt.Audience))
            throw new InvalidOperationException("JWT Audience не настроен. Пожалуйста, установите переменную окружения JWT_AUDIENCE.");
        if (jwt.AccessTokenLifetimeMinutes <= 0)
            throw new InvalidOperationException("JWT AccessTokenLifetimeMinutes должен быть больше 0. Пожалуйста, установите переменную окружения JWT_ACCESS_TOKEN_LIFETIME_MINUTES.");
        if (jwt.RefreshTokenLifetimeDays <= 0)
            throw new InvalidOperationException("JWT RefreshTokenLifetimeDays должен быть больше 0. Пожалуйста, установите переменную окружения JWT_REFRESH_TOKEN_LIFETIME_DAYS.");
        
        return jwt;
    }

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
                return (ApiResponse<AuthResponse>.ErrorResult("Неверный логин или пароль"), string.Empty);
            }

            if (!user.IsActive)
            {
                logger.LogWarning("Вход не выполнен: пользователь '{UserId}' деактивирован", user.Id);
                return (ApiResponse<AuthResponse>.ErrorResult("Аккаунт заблокирован"), string.Empty);
            }

            var passwordOk = PasswordHasher.Verify(request.Password, user.PasswordHash, user.PasswordSalt);
            if (!passwordOk)
            {
                logger.LogWarning("Вход не выполнен: не удалось проверить пароль для пользователя '{UserId}'", user.Id);
                return (ApiResponse<AuthResponse>.ErrorResult("Неверный логин или пароль"), string.Empty);
            }

            var tokens = CreateTokens(user);
            var response = user.ToAuthResponse(tokens.accessToken, _jwt.AccessTokenLifetimeMinutes * 60);

            return (ApiResponse<AuthResponse>.SuccessResult(response, "Авторизация выполнена успешно"), tokens.refreshToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка входа");
            return (ApiResponse<AuthResponse>.ErrorResult("Внутренняя ошибка сервера"), string.Empty);
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
                return ApiResponse<RegisterResponse>.ErrorResult("Имя пользователя уже занято");

            var existingByEmail = await userRepository.GetByEmailAsync(email, CancellationToken.None);
            if (existingByEmail != null)
                return ApiResponse<RegisterResponse>.ErrorResult("Email уже используется");

            var (hash, salt) = PasswordHasher.HashPassword(request.Password);

            var user = request.ToUserEntity(hash, salt);

            var createdUser = await userRepository.CreateAsync(user, CancellationToken.None);

            var response = createdUser.ToRegisterResponse();
            return ApiResponse<RegisterResponse>.SuccessResult(response);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка регистрации");
            return ApiResponse<RegisterResponse>.ErrorResult("Внутренняя ошибка сервера");
        }
    }

    /// <summary>
    /// Обновить токен доступа
    /// </summary>
    /// <param name="request">Данные для обновления токена</param>
    /// <returns>Новый токен доступа и refresh токен</returns>
    public Task<(ApiResponse<RefreshTokenResponse> response, string refreshToken)> RefreshTokenAsync(RefreshTokenRequest request)
    {
        try
        {
            var principal = ValidateTokenInternal(request.RefreshToken, validateLifetime: true, expectedTokenType: "refresh");
            if (principal == null)
            {
                return Task.FromResult((ApiResponse<RefreshTokenResponse>.ErrorResult("Неверный refresh токен"), string.Empty));
            }

            var sub = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            var name = principal.FindFirstValue(ClaimTypes.Name) ?? string.Empty;
            if (!Guid.TryParse(sub, out var userId))
            {
                return Task.FromResult((ApiResponse<RefreshTokenResponse>.ErrorResult("Неверный refresh токен"), string.Empty));
            }

            var accessToken = CreateJwtToken(userId, name, tokenType: "access", TimeSpan.FromMinutes(_jwt.AccessTokenLifetimeMinutes));
            var refreshToken = CreateJwtToken(userId, name, tokenType: "refresh", TimeSpan.FromDays(_jwt.RefreshTokenLifetimeDays));

            var response = EntityMapper.ToRefreshTokenResponse(accessToken, _jwt.AccessTokenLifetimeMinutes * 60);
            return Task.FromResult((ApiResponse<RefreshTokenResponse>.SuccessResult(response), refreshToken));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка обновления refresh токена");
            return Task.FromResult((ApiResponse<RefreshTokenResponse>.ErrorResult("Внутренняя ошибка сервера"), string.Empty));
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
            var principal = ValidateTokenInternal(accessToken, validateLifetime: true, expectedTokenType: "access");
            if (principal == null)
            {
                return ApiResponse<UserInfo>.ErrorResult("Неверный или просроченный токен");
            }

            var sub = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(sub, out var userId))
                return ApiResponse<UserInfo>.ErrorResult("Неверный токен");

            var user = await userRepository.GetByIdAsync(userId, CancellationToken.None);

            if (user == null)
                return ApiResponse<UserInfo>.ErrorResult("Пользователь не найден");
            
            var info = user.ToUserInfo();
            return ApiResponse<UserInfo>.SuccessResult(info);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка получения информации о пользователе");
            return ApiResponse<UserInfo>.ErrorResult("Внутренняя ошибка сервера");
        }
    }

    /// <summary>
    /// Проверить валидность токена
    /// </summary>
    /// <param name="accessToken">Токен доступа</param>
    /// <returns>True, если токен валиден</returns>
    public Task<bool> ValidateTokenAsync(string accessToken)
    {
        var principal = ValidateTokenInternal(accessToken, validateLifetime: true, expectedTokenType: "access");
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
                return ApiResponse<UserInfo>.ErrorResult("Пользователь не найден");

            if (!string.IsNullOrEmpty(request.Username))
            {
                var newUsername = request.Username.Trim();
                if (newUsername.Length >= 3)
                {
                    var existingByName = await userRepository.GetByNameAsync(newUsername, CancellationToken.None);
                    if (existingByName != null && existingByName.Id != userId)
                        return ApiResponse<UserInfo>.ErrorResult("Логин уже занят");
                }
            }

            if (request.Email != null)
            {
                var newEmail = request.Email.Trim();
                if (!string.IsNullOrEmpty(newEmail))
                {
                    var existingByEmail = await userRepository.GetByEmailAsync(newEmail, CancellationToken.None);
                    if (existingByEmail != null && existingByEmail.Id != userId)
                        return ApiResponse<UserInfo>.ErrorResult("Email уже используется");
                }
            }

            if (!string.IsNullOrEmpty(request.NewPassword))
            {
                if (string.IsNullOrEmpty(request.CurrentPassword))
                    return ApiResponse<UserInfo>.ErrorResult("Для смены пароля укажите текущий пароль");

                var passwordOk = PasswordHasher.Verify(request.CurrentPassword, user.PasswordHash ?? "", user.PasswordSalt ?? "");
                if (!passwordOk)
                    return ApiResponse<UserInfo>.ErrorResult("Неверный текущий пароль");
            }

            request.ApplyProfileUpdate(user);
            await userRepository.UpdateAsync(user, CancellationToken.None);

            var info = user.ToUserInfo();
            return ApiResponse<UserInfo>.SuccessResult(info, "Профиль обновлён");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка обновления профиля");
            return ApiResponse<UserInfo>.ErrorResult("Внутренняя ошибка сервера");
        }
    }

    private (string accessToken, string refreshToken) CreateTokens(UserEntity user)
    {
        var access = CreateJwtToken(user.Id, user.Name, tokenType: "access", TimeSpan.FromMinutes(_jwt.AccessTokenLifetimeMinutes));
        var refresh = CreateJwtToken(user.Id, user.Name, tokenType: "refresh", TimeSpan.FromDays(_jwt.RefreshTokenLifetimeDays));
        return (access, refresh);
    }

    private string CreateJwtToken(Guid userId, string username, string tokenType, TimeSpan lifetime)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.SecretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Name, username),
            new(ClaimTypes.Role, "user"),
            new("token_type", tokenType)
        };

        var now = DateTime.UtcNow;
        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            notBefore: now,
            expires: now.Add(lifetime),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private ClaimsPrincipal? ValidateTokenInternal(string token, bool validateLifetime, string expectedTokenType)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwt.SecretKey);
        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _jwt.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwt.Audience,
                ValidateLifetime = validateLifetime,
                ClockSkew = TimeSpan.FromSeconds(30),
                NameClaimType = ClaimTypes.Name,
                RoleClaimType = ClaimTypes.Role
            }, out _);

            var tokenType = principal.FindFirst("token_type")?.Value;
            if (!string.Equals(tokenType, expectedTokenType, StringComparison.Ordinal))
                return null;

            return principal;
        }
        catch
        {
            return null;
        }
    }
}
