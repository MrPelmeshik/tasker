using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using TaskerApi.Constants;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Services;

/// <summary>
/// Создание и валидация JWT access/refresh токенов.
/// </summary>
public class JwtTokenService(IOptions<JwtSettings> jwtOptions) : IJwtTokenService
{
    private readonly JwtSettings _jwt = ValidateJwtSettings(jwtOptions.Value);

    private static JwtSettings ValidateJwtSettings(JwtSettings jwt)
    {
        if (string.IsNullOrEmpty(jwt.SecretKey))
            throw new InvalidOperationException("JWT SecretKey не настроен. Установите переменную окружения JWT_SECRET_KEY.");
        if (string.IsNullOrEmpty(jwt.Issuer))
            throw new InvalidOperationException("JWT Issuer не настроен. Установите JWT_ISSUER.");
        if (string.IsNullOrEmpty(jwt.Audience))
            throw new InvalidOperationException("JWT Audience не настроен. Установите JWT_AUDIENCE.");
        if (jwt.AccessTokenLifetimeMinutes <= 0)
            throw new InvalidOperationException("JWT AccessTokenLifetimeMinutes должен быть больше 0. Установите JWT_ACCESS_TOKEN_LIFETIME_MINUTES.");
        if (jwt.RefreshTokenLifetimeDays <= 0)
            throw new InvalidOperationException("JWT RefreshTokenLifetimeDays должен быть больше 0. Установите JWT_REFRESH_TOKEN_LIFETIME_DAYS.");
        return jwt;
    }

    /// <inheritdoc />
    public (string accessToken, string refreshToken) CreateTokens(UserEntity user)
    {
        var access = CreateJwtToken(user.Id, user.Name, TokenTypes.Access, TimeSpan.FromMinutes(_jwt.AccessTokenLifetimeMinutes));
        var refresh = CreateJwtToken(user.Id, user.Name, TokenTypes.Refresh, TimeSpan.FromDays(_jwt.RefreshTokenLifetimeDays));
        return (access, refresh);
    }

    /// <inheritdoc />
    public string ComputeRefreshTokenHash(string refreshToken)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(refreshToken));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    /// <inheritdoc />
    public ClaimsPrincipal? ValidateToken(string token, bool validateLifetime, string expectedTokenType)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwt.SecretKey);
        var clockSkew = TimeSpan.FromSeconds(_jwt.ClockSkewSeconds > 0 ? _jwt.ClockSkewSeconds : 30);
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
                ClockSkew = clockSkew,
                NameClaimType = ClaimTypes.Name,
                RoleClaimType = ClaimTypes.Role
            }, out _);

            var tokenType = principal.FindFirst(JwtClaimNames.TokenType)?.Value;
            if (!string.Equals(tokenType, expectedTokenType, StringComparison.Ordinal))
                return null;
            return principal;
        }
        catch
        {
            return null;
        }
    }

    private string CreateJwtToken(Guid userId, string username, string tokenType, TimeSpan lifetime)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.SecretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Name, username),
            new(ClaimTypes.Role, Roles.User),
            new(JwtClaimNames.TokenType, tokenType)
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
}
