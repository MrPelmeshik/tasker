using System.Security.Claims;
using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Сервис создания и валидации JWT-токенов.
/// </summary>
public interface IJwtTokenService
{
    /// <summary>Создать пару access и refresh токенов для пользователя.</summary>
    (string accessToken, string refreshToken) CreateTokens(UserEntity user);

    /// <summary>Вычислить хэш refresh-токена для хранения.</summary>
    string ComputeRefreshTokenHash(string refreshToken);

    /// <summary>Валидировать токен и вернуть principal или null.</summary>
    /// <param name="token">Строка токена</param>
    /// <param name="validateLifetime">Проверять срок действия</param>
    /// <param name="expectedTokenType">Ожидаемый тип: "access" или "refresh"</param>
    ClaimsPrincipal? ValidateToken(string token, bool validateLifetime, string expectedTokenType);
}
