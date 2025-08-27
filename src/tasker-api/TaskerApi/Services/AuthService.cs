using System.Security.Claims;
using System.Text.Json;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services;

/// <summary>
/// Сервис авторизации
/// </summary>
public class AuthService : IAuthService
{
    private readonly IKeycloakProvider _keycloakProvider;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IKeycloakProvider keycloakProvider,
        ILogger<AuthService> logger)
    {
        _keycloakProvider = keycloakProvider;
        _logger = logger;
    }

    /// <summary>
    /// Авторизация пользователя
    /// </summary>
    public async Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request)
    {
        try
        {
            _logger.LogInformation("Attempting login for user: {Username}", request.Username);

            // Получаем токены от Keycloak
            var keycloakResponse = await _keycloakProvider.GetTokenAsync(request.Username, request.Password);

            // Получаем информацию о пользователе
            var userInfo = await _keycloakProvider.GetUserInfoAsync(keycloakResponse.AccessToken);

            // Извлекаем роли из токена
            var roles = ExtractRolesFromToken(keycloakResponse.AccessToken);

            var authResponse = new AuthResponse
            {
                AccessToken = keycloakResponse.AccessToken,
                RefreshToken = keycloakResponse.RefreshToken,
                TokenType = keycloakResponse.TokenType,
                ExpiresIn = keycloakResponse.ExpiresIn,
                UserInfo = new UserInfo
                {
                    Id = userInfo.Sub,
                    Username = userInfo.PreferredUsername,
                    Email = userInfo.Email,
                    FirstName = userInfo.GivenName,
                    LastName = userInfo.FamilyName,
                    Roles = roles
                }
            };

            _logger.LogInformation("User {Username} successfully logged in", request.Username);

            return ApiResponse<AuthResponse>.SuccessResult(authResponse, "Авторизация выполнена успешно");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for user: {Username}", request.Username);
            return ApiResponse<AuthResponse>.ErrorResult("Ошибка авторизации. Проверьте логин и пароль.");
        }
    }

    /// <summary>
    /// Регистрация нового пользователя
    /// </summary>
    public async Task<ApiResponse<RegisterResponse>> RegisterAsync(RegisterRequest request)
    {
        try
        {
            _logger.LogInformation("Attempting to register new user: {Username}", request.Username);

            // Проверяем, что пароли совпадают
            if (request.Password != request.ConfirmPassword)
            {
                return ApiResponse<RegisterResponse>.ErrorResult("Пароли не совпадают");
            }

            // Создаем пользователя в Keycloak
            var userId = await _keycloakProvider.CreateUserAsync(request);

            var registerResponse = new RegisterResponse
            {
                UserId = userId,
                Message = "Пользователь успешно зарегистрирован"
            };

            _logger.LogInformation("User {Username} successfully registered with ID: {UserId}", 
                request.Username, userId);

            return ApiResponse<RegisterResponse>.SuccessResult(registerResponse, "Регистрация выполнена успешно");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for user: {Username}", request.Username);
            return ApiResponse<RegisterResponse>.ErrorResult("Ошибка регистрации. Попробуйте позже.");
        }
    }

    /// <summary>
    /// Обновление токена доступа
    /// </summary>
    public async Task<ApiResponse<RefreshTokenResponse>> RefreshTokenAsync(RefreshTokenRequest request)
    {
        try
        {
            _logger.LogInformation("Attempting to refresh token");

            // Обновляем токен через Keycloak
            var keycloakResponse = await _keycloakProvider.RefreshTokenAsync(request.RefreshToken);

            var refreshResponse = new RefreshTokenResponse
            {
                AccessToken = keycloakResponse.AccessToken,
                RefreshToken = keycloakResponse.RefreshToken,
                TokenType = keycloakResponse.TokenType,
                ExpiresIn = keycloakResponse.ExpiresIn
            };

            _logger.LogInformation("Token successfully refreshed");

            return ApiResponse<RefreshTokenResponse>.SuccessResult(refreshResponse, "Токен успешно обновлен");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return ApiResponse<RefreshTokenResponse>.ErrorResult("Ошибка обновления токена. Токен недействителен или истек.");
        }
    }

    /// <summary>
    /// Выход из системы
    /// </summary>
    public async Task<ApiResponse<object>> LogoutAsync(LogoutRequest request)
    {
        try
        {
            _logger.LogInformation("Attempting to logout user");

            // Отзываем токен в Keycloak
            var success = await _keycloakProvider.RevokeTokenAsync(request.RefreshToken);

            if (success)
            {
                _logger.LogInformation("User successfully logged out");
                return ApiResponse<object>.SuccessResult(null, "Выход выполнен успешно");
            }
            else
            {
                _logger.LogWarning("Failed to revoke token during logout");
                return ApiResponse<object>.ErrorResult("Ошибка при выходе из системы");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return ApiResponse<object>.ErrorResult("Ошибка при выходе из системы");
        }
    }

    /// <summary>
    /// Получение информации о текущем пользователе
    /// </summary>
    public async Task<ApiResponse<UserInfo>> GetUserInfoAsync(string accessToken)
    {
        try
        {
            _logger.LogInformation("Attempting to get user info");

            // Получаем информацию о пользователе из Keycloak
            var keycloakUserInfo = await _keycloakProvider.GetUserInfoAsync(accessToken);

            // Извлекаем роли из токена
            var roles = ExtractRolesFromToken(accessToken);

            var userInfo = new UserInfo
            {
                Id = keycloakUserInfo.Sub,
                Username = keycloakUserInfo.PreferredUsername,
                Email = keycloakUserInfo.Email,
                FirstName = keycloakUserInfo.GivenName,
                LastName = keycloakUserInfo.FamilyName,
                Roles = roles
            };

            _logger.LogInformation("User info successfully retrieved for user: {Username}", userInfo.Username);

            return ApiResponse<UserInfo>.SuccessResult(userInfo, "Информация о пользователе получена");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user info");
            return ApiResponse<UserInfo>.ErrorResult("Ошибка получения информации о пользователе");
        }
    }

    /// <summary>
    /// Проверка валидности токена
    /// </summary>
    public async Task<bool> ValidateTokenAsync(string accessToken)
    {
        try
        {
            return await _keycloakProvider.ValidateTokenAsync(accessToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating token");
            return false;
        }
    }

    /// <summary>
    /// Извлечение ролей из JWT токена
    /// </summary>
    private List<string> ExtractRolesFromToken(string accessToken)
    {
        try
        {
            var roles = new List<string>();

            // Декодируем JWT токен (без проверки подписи, так как это уже проверено)
            var parts = accessToken.Split('.');
            if (parts.Length != 3)
            {
                return roles;
            }

            var payload = parts[1];
            var paddedPayload = payload.PadRight(4 * ((payload.Length + 3) / 4), '=');
            var decodedPayload = Convert.FromBase64String(paddedPayload.Replace('-', '+').Replace('_', '/'));
            var jsonPayload = System.Text.Encoding.UTF8.GetString(decodedPayload);

            using var document = JsonDocument.Parse(jsonPayload);
            var root = document.RootElement;

            // Извлекаем realm_access.roles
            if (root.TryGetProperty("realm_access", out var realmAccess) &&
                realmAccess.TryGetProperty("roles", out var realmRoles))
            {
                foreach (var role in realmRoles.EnumerateArray())
                {
                    if (role.ValueKind == JsonValueKind.String)
                    {
                        roles.Add(role.GetString() ?? string.Empty);
                    }
                }
            }

            // Извлекаем resource_access[clientId].roles
            if (root.TryGetProperty("resource_access", out var resourceAccess))
            {
                // Здесь нужно знать clientId для извлечения ролей клиента
                // Пока извлекаем все доступные роли
                foreach (var resource in resourceAccess.EnumerateObject())
                {
                    if (resource.Value.TryGetProperty("roles", out var clientRoles))
                    {
                        foreach (var role in clientRoles.EnumerateArray())
                        {
                            if (role.ValueKind == JsonValueKind.String)
                            {
                                var roleValue = role.GetString() ?? string.Empty;
                                if (!roles.Contains(roleValue))
                                {
                                    roles.Add(roleValue);
                                }
                            }
                        }
                    }
                }
            }

            return roles.Where(r => !string.IsNullOrEmpty(r)).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting roles from token");
            return new List<string>();
        }
    }
}
