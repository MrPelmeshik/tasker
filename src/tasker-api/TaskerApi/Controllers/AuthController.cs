using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using TaskerApi.Constants;
using TaskerApi.Helpers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Controllers;

/// <summary>
/// Контроллер авторизации и регистрации пользователей
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController(
    IAuthService authService,
    ILogger<AuthController> logger,
    IOptions<JwtSettings> jwtOptions,
    IOptions<AuthSettings> authOptions)
    : ControllerBase
{
    private readonly JwtSettings _jwt = jwtOptions.Value;
    private readonly AuthSettings _auth = authOptions.Value;

    /// <summary>
    /// Авторизация пользователя
    /// </summary>
    /// <param name="request">Данные для авторизации</param>
    /// <returns>Токены доступа и информация о пользователе</returns>
    /// <response code="200">Успешная авторизация</response>
    /// <response code="400">Неверные данные для авторизации</response>
    /// <response code="500">Внутренняя ошибка сервера</response>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), 400)]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), 500)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<AuthResponse>.ErrorResult(ErrorMessages.ValidationError, errors));
            }

            var (result, refreshToken) = await authService.LoginAsync(request);

            if (result.Success && result.Data != null)
            {
                var isSecure = string.Equals(Request.Scheme, "https", StringComparison.OrdinalIgnoreCase);
                var path = string.IsNullOrEmpty(_auth.CookiePath) ? "/api/auth" : _auth.CookiePath;
                var opts = CookieAuthHelper.CreateRefreshTokenCookieOptions(path, DateTimeOffset.UtcNow.AddDays(_jwt.RefreshTokenLifetimeDays), isSecure);
                Response.Cookies.Append(_auth.RefreshTokenCookieName, refreshToken, opts);

                return Ok(result);
            }

            return BadRequest(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Неожиданная ошибка при входе");
            return StatusCode(500, ApiResponse<AuthResponse>.ErrorResult(ErrorMessages.InternalError));
        }
    }

    /// <summary>
    /// Регистрация нового пользователя
    /// </summary>
    /// <param name="request">Данные для регистрации</param>
    /// <returns>Результат регистрации</returns>
    /// <response code="201">Пользователь успешно зарегистрирован</response>
    /// <response code="400">Неверные данные для регистрации</response>
    /// <response code="500">Внутренняя ошибка сервера</response>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<RegisterResponse>), 201)]
    [ProducesResponseType(typeof(ApiResponse<RegisterResponse>), 400)]
    [ProducesResponseType(typeof(ApiResponse<RegisterResponse>), 500)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<RegisterResponse>.ErrorResult(ErrorMessages.ValidationError, errors));
            }

            var result = await authService.RegisterAsync(request);

            if (result.Success)
            {
                return CreatedAtAction(nameof(Register), result);
            }

            return BadRequest(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Неожиданная ошибка при регистрации");
            return StatusCode(500, ApiResponse<RegisterResponse>.ErrorResult(ErrorMessages.InternalError));
        }
    }

    /// <summary>
    /// Обновление токена доступа
    /// </summary>
    /// <param name="request">Refresh токен</param>
    /// <returns>Новые токены доступа</returns>
    /// <response code="200">Токен успешно обновлен</response>
    /// <response code="400">Неверный refresh токен</response>
    /// <response code="500">Внутренняя ошибка сервера</response>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<RefreshTokenResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<RefreshTokenResponse>), 400)]
    [ProducesResponseType(typeof(ApiResponse<RefreshTokenResponse>), 500)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            if (Request.Cookies.TryGetValue(_auth.RefreshTokenCookieName, out var cookieRefresh) && !string.IsNullOrWhiteSpace(cookieRefresh))
            {
                request.RefreshToken = cookieRefresh;
            }

            if (string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                return BadRequest(ApiResponse<RefreshTokenResponse>.ErrorResult(ErrorMessages.RefreshTokenMissing));
            }

            var (result, newRefresh) = await authService.RefreshTokenAsync(request);

            if (result.Success && result.Data != null)
            {
                var isSecure = string.Equals(Request.Scheme, "https", StringComparison.OrdinalIgnoreCase);
                var path = string.IsNullOrEmpty(_auth.CookiePath) ? "/api/auth" : _auth.CookiePath;
                var opts = CookieAuthHelper.CreateRefreshTokenCookieOptions(path, DateTimeOffset.UtcNow.AddDays(_jwt.RefreshTokenLifetimeDays), isSecure);
                Response.Cookies.Append(_auth.RefreshTokenCookieName, newRefresh, opts);
                return Ok(result);
            }

            return BadRequest(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Неожиданная ошибка при обновлении токена");
            return StatusCode(500, ApiResponse<RefreshTokenResponse>.ErrorResult(ErrorMessages.InternalError));
        }
    }

    /// <summary>
    /// Выход из системы
    /// </summary>
    /// <returns>Результат выхода</returns>
    /// <response code="200">Выход выполнен успешно</response>
    /// <response code="500">Внутренняя ошибка сервера</response>
    [HttpPost("logout")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> Logout()
    {
        try
        {
            string? refreshToken = null;
            if (Request.Cookies.TryGetValue(_auth.RefreshTokenCookieName, out var cookieValue) && !string.IsNullOrWhiteSpace(cookieValue))
                refreshToken = cookieValue;

            await authService.RevokeRefreshTokenAsync(refreshToken);

            if (Request.Cookies.ContainsKey(_auth.RefreshTokenCookieName))
            {
                var isSecure = string.Equals(Request.Scheme, "https", StringComparison.OrdinalIgnoreCase);
                var path = string.IsNullOrEmpty(_auth.CookiePath) ? "/api/auth" : _auth.CookiePath;
                Response.Cookies.Append(_auth.RefreshTokenCookieName, string.Empty, CookieAuthHelper.CreateExpiredCookieOptions(path, isSecure));
            }

            return Ok(ApiResponse<object>.SuccessResult(new { }, SuccessMessages.LogoutSuccess));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Неожиданная ошибка при выходе");
            return StatusCode(500, ApiResponse<object>.ErrorResult(ErrorMessages.InternalError));
        }
    }

    /// <summary>
    /// Получение информации о текущем пользователе
    /// </summary>
    /// <returns>Информация о пользователе</returns>
    /// <response code="200">Информация о пользователе получена</response>
    /// <response code="401">Неавторизованный доступ</response>
    /// <response code="500">Внутренняя ошибка сервера</response>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserInfo>), 200)]
    [ProducesResponseType(typeof(ApiResponse<UserInfo>), 401)]
    [ProducesResponseType(typeof(ApiResponse<UserInfo>), 500)]
    public async Task<IActionResult> GetCurrentUser()
    {
        try
        {
            // Получаем токен из заголовка Authorization
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith(AuthConstants.BearerSchemePrefix))
            {
                return Unauthorized(ApiResponse<UserInfo>.ErrorResult(ErrorMessages.TokenNotProvided));
            }

            var accessToken = authHeader.Substring(AuthConstants.BearerSchemePrefix.Length);

            var result = await authService.GetUserInfoAsync(accessToken);

            if (result.Success)
            {
                return Ok(result);
            }

            return Unauthorized(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Неожиданная ошибка при получении информации о текущем пользователе");
            return StatusCode(500, ApiResponse<UserInfo>.ErrorResult(ErrorMessages.InternalError));
        }
    }

    /// <summary>
    /// Проверка состояния авторизации
    /// </summary>
    /// <returns>Статус авторизации</returns>
    /// <response code="200">Пользователь авторизован</response>
    /// <response code="401">Пользователь не авторизован</response>
    [HttpGet("status")]
    [Authorize]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public IActionResult GetAuthStatus()
    {
        return Ok(new {
            authenticated = true,
            message = SuccessMessages.UserAuthenticated,
            timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Обновление профиля текущего пользователя (email, firstName, lastName).
    /// </summary>
    /// <param name="request">Данные для обновления</param>
    /// <returns>Обновлённая информация о пользователе</returns>
    /// <response code="200">Профиль обновлён</response>
    /// <response code="400">Ошибка валидации или email уже используется</response>
    /// <response code="401">Неавторизованный доступ</response>
    [HttpPatch("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserInfo>), 200)]
    [ProducesResponseType(typeof(ApiResponse<UserInfo>), 400)]
    [ProducesResponseType(typeof(ApiResponse<UserInfo>), 401)]
    public async Task<IActionResult> UpdateProfile([FromBody] ProfileUpdateRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(ApiResponse<UserInfo>.ErrorResult(ErrorMessages.TokenInvalidForProfile));

            if (request == null)
                return BadRequest(ApiResponse<UserInfo>.ErrorResult(ErrorMessages.RequestBodyEmpty));

            var result = await authService.UpdateProfileAsync(userId, request);

            if (result.Success)
                return Ok(result);

            return BadRequest(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Неожиданная ошибка при обновлении профиля");
            return StatusCode(500, ApiResponse<UserInfo>.ErrorResult(ErrorMessages.InternalError));
        }
    }
}
