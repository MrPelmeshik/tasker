using TaskerApi.Core;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services.Mapping;

/// <summary>
/// Маппинг для User (partial)
/// </summary>
public static partial class EntityMapper
{
    /// <summary>
    /// Маппинг UserEntity в UserResponse (без чувствительных данных).
    /// </summary>
    public static UserResponse ToUserResponse(this UserEntity entity)
    {
        var roles = entity.IsAdmin ? new List<string> { "admin", "user" } : new List<string> { "user" };
        return new UserResponse
        {
            Id = entity.Id,
            Username = entity.Name,
            Email = entity.Email,
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            Roles = roles,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsActive = entity.IsActive,
            DeactivatedAt = entity.DeactivatedAt
        };
    }

    /// <summary>
    /// Маппинг UserEntity в UserInfo
    /// </summary>
    public static UserInfo ToUserInfo(this UserEntity entity)
    {
        return new UserInfo
        {
            Id = entity.Id.ToString(),
            Username = entity.Name,
            Email = entity.Email ?? string.Empty,
            FirstName = entity.FirstName ?? string.Empty,
            LastName = entity.LastName ?? string.Empty,
            Roles = new List<string> { "user" }
        };
    }

    /// <summary>
    /// Маппинг UserEntity в AuthResponse
    /// </summary>
    public static AuthResponse ToAuthResponse(this UserEntity entity, string accessToken, int expiresIn)
    {
        return new AuthResponse
        {
            AccessToken = accessToken,
            ExpiresIn = expiresIn,
            UserInfo = entity.ToUserInfo()
        };
    }

    /// <summary>
    /// Маппинг UserCreateRequest в UserEntity с хешированием пароля.
    /// </summary>
    public static UserEntity ToUserEntity(this UserCreateRequest request)
    {
        var (hash, salt) = PasswordHasher.HashPassword(request.Password);
        return new UserEntity
        {
            Id = Guid.NewGuid(),
            Name = request.Username.Trim(),
            Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim(),
            FirstName = string.IsNullOrWhiteSpace(request.FirstName) ? null : request.FirstName.Trim(),
            LastName = string.IsNullOrWhiteSpace(request.LastName) ? null : request.LastName.Trim(),
            PasswordHash = hash,
            PasswordSalt = salt,
            IsAdmin = request.IsAdmin,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };
    }

    /// <summary>
    /// Частичное обновление UserEntity из UserUpdateRequest.
    /// </summary>
    public static void UpdateUserEntity(this UserUpdateRequest request, UserEntity entity)
    {
        if (request.Username != null)
            entity.Name = request.Username.Trim();
        if (request.Email != null)
            entity.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        if (request.FirstName != null)
            entity.FirstName = string.IsNullOrWhiteSpace(request.FirstName) ? null : request.FirstName.Trim();
        if (request.LastName != null)
            entity.LastName = string.IsNullOrWhiteSpace(request.LastName) ? null : request.LastName.Trim();
        if (request.Password != null)
        {
            var (hash, salt) = PasswordHasher.HashPassword(request.Password);
            entity.PasswordHash = hash;
            entity.PasswordSalt = salt;
        }
        if (request.IsAdmin.HasValue)
            entity.IsAdmin = request.IsAdmin.Value;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Частичное обновление UserEntity из ProfileUpdateRequest.
    /// </summary>
    public static void ApplyProfileUpdate(this ProfileUpdateRequest request, UserEntity entity)
    {
        if (request.Username != null)
            entity.Name = request.Username.Trim();
        if (request.Email != null)
            entity.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        if (request.FirstName != null)
            entity.FirstName = string.IsNullOrWhiteSpace(request.FirstName) ? null : request.FirstName.Trim();
        if (request.LastName != null)
            entity.LastName = string.IsNullOrWhiteSpace(request.LastName) ? null : request.LastName.Trim();
        if (!string.IsNullOrEmpty(request.NewPassword))
        {
            var (hash, salt) = PasswordHasher.HashPassword(request.NewPassword);
            entity.PasswordHash = hash;
            entity.PasswordSalt = salt;
        }
        entity.UpdatedAt = DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Маппинг RegisterRequest в UserEntity
    /// </summary>
    public static UserEntity ToUserEntity(this RegisterRequest request, string passwordHash, string passwordSalt)
    {
        return new UserEntity
        {
            Id = Guid.NewGuid(),
            Name = request.Username.Trim(),
            Email = request.Email.Trim(),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt,
            CreatedAt = DateTimeOffset.Now,
            UpdatedAt = DateTimeOffset.Now,
            IsActive = true
        };
    }

    /// <summary>
    /// Маппинг UserEntity в RegisterResponse
    /// </summary>
    public static RegisterResponse ToRegisterResponse(this UserEntity entity)
    {
        return new RegisterResponse
        {
            UserId = entity.Id.ToString(),
            Message = "Пользователь успешно зарегистрирован"
        };
    }

    /// <summary>
    /// Маппинг RefreshTokenRequest в RefreshTokenResponse
    /// </summary>
    public static RefreshTokenResponse ToRefreshTokenResponse(string accessToken, int expiresIn)
    {
        return new RefreshTokenResponse
        {
            AccessToken = accessToken,
            ExpiresIn = expiresIn,
            TokenType = "Bearer"
        };
    }
}
