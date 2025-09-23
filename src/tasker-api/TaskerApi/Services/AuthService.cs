using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using TaskerApi.Core;
using TaskerApi.Interfaces.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services;

public class AuthService(
    ILogger<AuthService> logger,
    IOptions<JwtSettings> jwtOptions,
    IUnitOfWorkFactory uowFactory,
    IUserProvider userProvider) : IAuthService
{
    private readonly JwtSettings _jwt = ValidateJwtSettings(jwtOptions.Value);

    private static JwtSettings ValidateJwtSettings(JwtSettings jwt)
    {
        if (string.IsNullOrEmpty(jwt.SecretKey))
            throw new InvalidOperationException("JWT SecretKey is not configured. Please set JWT_SECRET_KEY environment variable.");
        if (string.IsNullOrEmpty(jwt.Issuer))
            throw new InvalidOperationException("JWT Issuer is not configured. Please set JWT_ISSUER environment variable.");
        if (string.IsNullOrEmpty(jwt.Audience))
            throw new InvalidOperationException("JWT Audience is not configured. Please set JWT_AUDIENCE environment variable.");
        if (jwt.AccessTokenLifetimeMinutes <= 0)
            throw new InvalidOperationException("JWT AccessTokenLifetimeMinutes must be greater than 0. Please set JWT_ACCESS_TOKEN_LIFETIME_MINUTES environment variable.");
        if (jwt.RefreshTokenLifetimeDays <= 0)
            throw new InvalidOperationException("JWT RefreshTokenLifetimeDays must be greater than 0. Please set JWT_REFRESH_TOKEN_LIFETIME_DAYS environment variable.");
        
        return jwt;
    }

    public async Task<(ApiResponse<AuthResponse> response, string refreshToken)> LoginAsync(LoginRequest request)
    {
        try
        {
            await using var uow = await uowFactory.CreateAsync(CancellationToken.None);

            UserEntity? user;
            var username = request.Username.Trim();
            logger.LogInformation("Попытка входа для имени пользователя/email '{Username}'", username);
            if (username.Contains('@'))
            {
                user = await userProvider.GetByEmailAsync(uow.Connection, username, CancellationToken.None, uow.Transaction);
            }
            else
            {
                user = await userProvider.GetByNameAsync(uow.Connection, username, CancellationToken.None, uow.Transaction);
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
            var response = new AuthResponse
            {
                AccessToken = tokens.accessToken,
                ExpiresIn = _jwt.AccessTokenLifetimeMinutes * 60,
                UserInfo = new UserInfo
                {
                    Id = user.Id.ToString(),
                    Username = user.Name,
                    Email = user.Email ?? string.Empty,
                    FirstName = user.FirstName ?? string.Empty,
                    LastName = user.LastName ?? string.Empty,
                    Roles = new List<string> { "user" }
                }
            };

            return (ApiResponse<AuthResponse>.SuccessResult(response, "Авторизация выполнена успешно"), tokens.refreshToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка входа");
            return (ApiResponse<AuthResponse>.ErrorResult("Внутренняя ошибка сервера"), string.Empty);
        }
    }

    public async Task<ApiResponse<RegisterResponse>> RegisterAsync(RegisterRequest request)
    {
        try
        {
            await using var uow = await uowFactory.CreateAsync(CancellationToken.None, useTransaction: true);

            var username = request.Username.Trim();
            var email = request.Email.Trim();

            var existingByName = await userProvider.GetByNameAsync(uow.Connection, username, CancellationToken.None, uow.Transaction);
            if (existingByName != null)
                return ApiResponse<RegisterResponse>.ErrorResult("Имя пользователя уже занято");

            var existingByEmail = await userProvider.GetByEmailAsync(uow.Connection, email, CancellationToken.None, uow.Transaction);
            if (existingByEmail != null)
                return ApiResponse<RegisterResponse>.ErrorResult("Email уже используется");

            var (hash, salt) = PasswordHasher.HashPassword(request.Password);

            var user = new UserEntity
            {
                Id = Guid.NewGuid(),
                Name = username,
                Email = email,
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                PasswordHash = hash,
                PasswordSalt = salt,
                CreatedAt = DateTimeOffset.Now,
                UpdatedAt = DateTimeOffset.Now,
                IsActive = true
            };

            user.Id = await userProvider.CreateAsync(uow.Connection, user, CancellationToken.None, uow.Transaction, setDefaultValues: true);
            await uow.CommitAsync(CancellationToken.None);

            var response = new RegisterResponse
            {
                UserId = user.Id.ToString(),
                Message = "Пользователь успешно зарегистрирован"
            };
            return ApiResponse<RegisterResponse>.SuccessResult(response);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка регистрации");
            return ApiResponse<RegisterResponse>.ErrorResult("Внутренняя ошибка сервера");
        }
    }

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

            var response = new RefreshTokenResponse
            {
                AccessToken = accessToken,
                ExpiresIn = _jwt.AccessTokenLifetimeMinutes * 60,
                TokenType = "Bearer"
            };
            return Task.FromResult((ApiResponse<RefreshTokenResponse>.SuccessResult(response), refreshToken));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка обновления refresh токена");
            return Task.FromResult((ApiResponse<RefreshTokenResponse>.ErrorResult("Внутренняя ошибка сервера"), string.Empty));
        }
    }


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

            await using var uow = await uowFactory.CreateAsync(CancellationToken.None);
            var user = await userProvider.GetByIdAsync(
                uow.Connection, 
                userId,
                CancellationToken.None, 
                transaction: uow.Transaction);

            if (user == null)
                return ApiResponse<UserInfo>.ErrorResult("Пользователь не найден");
            
            var info = new UserInfo
            {
                Id = user.Id.ToString(),
                Username = user.Name,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                Roles = ["user"]
            };
            return ApiResponse<UserInfo>.SuccessResult(info);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка получения информации о пользователе");
            return ApiResponse<UserInfo>.ErrorResult("Внутренняя ошибка сервера");
        }
    }

    public Task<bool> ValidateTokenAsync(string accessToken)
    {
        var principal = ValidateTokenInternal(accessToken, validateLifetime: true, expectedTokenType: "access");
        return Task.FromResult(principal != null);
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
