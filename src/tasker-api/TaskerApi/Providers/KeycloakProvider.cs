using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Configuration;
using TaskerApi.Models.Requests;

namespace TaskerApi.Providers;

/// <summary>
/// Провайдер для работы с Keycloak API
/// </summary>
public class KeycloakProvider : IKeycloakProvider
{
    private readonly HttpClient _httpClient;
    private readonly KeycloakSettings _keycloakSettings;
    private readonly ILogger<KeycloakProvider> _logger;

    public KeycloakProvider(
        HttpClient httpClient,
        IOptions<KeycloakSettings> keycloakSettings,
        ILogger<KeycloakProvider> logger)
    {
        _httpClient = httpClient;
        _keycloakSettings = keycloakSettings.Value;
        _logger = logger;
    }

    /// <summary>
    /// Получение токенов доступа
    /// </summary>
    public async Task<KeycloakTokenResponse> GetTokenAsync(string username, string password)
    {
        try
        {
            var tokenEndpoint = $"{_keycloakSettings.Authority}/protocol/openid-connect/token";
            
            var formData = new List<KeyValuePair<string, string>>
            {
                new("grant_type", "password"),
                new("client_id", _keycloakSettings.ClientId),
                new("client_secret", _keycloakSettings.ClientSecret),
                new("username", username),
                new("password", password),
                new("scope", "openid profile email")
            };

            var content = new FormUrlEncodedContent(formData);
            var response = await _httpClient.PostAsync(tokenEndpoint, content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to get token from Keycloak. Status: {Status}, Content: {Content}", 
                    response.StatusCode, errorContent);
                throw new HttpRequestException($"Failed to get token: {response.StatusCode}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var tokenResponse = JsonSerializer.Deserialize<KeycloakTokenResponse>(responseContent, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (tokenResponse == null)
            {
                throw new InvalidOperationException("Failed to deserialize token response");
            }

            return tokenResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting token from Keycloak");
            throw;
        }
    }

    /// <summary>
    /// Обновление токена доступа
    /// </summary>
    public async Task<KeycloakTokenResponse> RefreshTokenAsync(string refreshToken)
    {
        try
        {
            var tokenEndpoint = $"{_keycloakSettings.Authority}/protocol/openid-connect/token";
            
            var formData = new List<KeyValuePair<string, string>>
            {
                new("grant_type", "refresh_token"),
                new("client_id", _keycloakSettings.ClientId),
                new("client_secret", _keycloakSettings.ClientSecret),
                new("refresh_token", refreshToken)
            };

            var content = new FormUrlEncodedContent(formData);
            var response = await _httpClient.PostAsync(tokenEndpoint, content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to refresh token from Keycloak. Status: {Status}, Content: {Content}", 
                    response.StatusCode, errorContent);
                throw new HttpRequestException($"Failed to refresh token: {response.StatusCode}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var tokenResponse = JsonSerializer.Deserialize<KeycloakTokenResponse>(responseContent, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (tokenResponse == null)
            {
                throw new InvalidOperationException("Failed to deserialize refresh token response");
            }

            return tokenResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing token from Keycloak");
            throw;
        }
    }

    /// <summary>
    /// Отзыв токена
    /// </summary>
    public async Task<bool> RevokeTokenAsync(string refreshToken)
    {
        try
        {
            var revokeEndpoint = $"{_keycloakSettings.Authority}/protocol/openid-connect/logout";
            
            var formData = new List<KeyValuePair<string, string>>
            {
                new("client_id", _keycloakSettings.ClientId),
                new("client_secret", _keycloakSettings.ClientSecret),
                new("refresh_token", refreshToken)
            };

            var content = new FormUrlEncodedContent(formData);
            var response = await _httpClient.PostAsync(revokeEndpoint, content);

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking token from Keycloak");
            return false;
        }
    }

    /// <summary>
    /// Получение информации о пользователе
    /// </summary>
    public async Task<KeycloakUserInfo> GetUserInfoAsync(string accessToken)
    {
        try
        {
            var userInfoEndpoint = $"{_keycloakSettings.Authority}/protocol/openid-connect/userinfo";
            
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            
            var response = await _httpClient.GetAsync(userInfoEndpoint);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to get user info from Keycloak. Status: {Status}, Content: {Content}", 
                    response.StatusCode, errorContent);
                throw new HttpRequestException($"Failed to get user info: {response.StatusCode}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var userInfo = JsonSerializer.Deserialize<KeycloakUserInfo>(responseContent, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (userInfo == null)
            {
                throw new InvalidOperationException("Failed to deserialize user info response");
            }

            return userInfo;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user info from Keycloak");
            throw;
        }
    }

    /// <summary>
    /// Создание нового пользователя
    /// </summary>
    public async Task<string> CreateUserAsync(RegisterRequest request)
    {
        try
        {
            var usersEndpoint = $"{_keycloakSettings.Authority}/users";
            
            var userData = new
            {
                username = request.Username,
                email = request.Email,
                firstName = request.FirstName,
                lastName = request.LastName,
                enabled = true,
                emailVerified = false,
                credentials = new[]
                {
                    new
                    {
                        type = "password",
                        value = request.Password,
                        temporary = false
                    }
                }
            };

            var jsonContent = JsonSerializer.Serialize(userData);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
            
            // Добавляем заголовок авторизации для администратора Keycloak
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", 
                await GetAdminTokenAsync());

            var response = await _httpClient.PostAsync(usersEndpoint, content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to create user in Keycloak. Status: {Status}, Content: {Content}", 
                    response.StatusCode, errorContent);
                throw new HttpRequestException($"Failed to create user: {response.StatusCode}");
            }

            // Получаем ID созданного пользователя из заголовка Location
            var locationHeader = response.Headers.Location?.ToString();
            if (string.IsNullOrEmpty(locationHeader))
            {
                throw new InvalidOperationException("User created but ID not returned");
            }

            var userId = locationHeader.Split('/').Last();
            return userId;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user in Keycloak");
            throw;
        }
    }

    /// <summary>
    /// Проверка валидности токена
    /// </summary>
    public async Task<bool> ValidateTokenAsync(string accessToken)
    {
        try
        {
            var userInfo = await GetUserInfoAsync(accessToken);
            return !string.IsNullOrEmpty(userInfo.Sub);
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Получение токена администратора для управления пользователями
    /// </summary>
    private async Task<string> GetAdminTokenAsync()
    {
        try
        {
            var tokenEndpoint = $"{_keycloakSettings.Authority}/protocol/openid-connect/token";
            
            var formData = new List<KeyValuePair<string, string>>
            {
                new("grant_type", "client_credentials"),
                new("client_id", _keycloakSettings.ClientId),
                new("client_secret", _keycloakSettings.ClientSecret)
            };

            var content = new FormUrlEncodedContent(formData);
            var response = await _httpClient.PostAsync(tokenEndpoint, content);

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Failed to get admin token: {response.StatusCode}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var tokenResponse = JsonSerializer.Deserialize<KeycloakTokenResponse>(responseContent, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (tokenResponse == null)
            {
                throw new InvalidOperationException("Failed to deserialize admin token response");
            }

            return tokenResponse.AccessToken;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting admin token from Keycloak");
            throw;
        }
    }
}
