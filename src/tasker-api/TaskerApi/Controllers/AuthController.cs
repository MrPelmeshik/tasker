using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using System.Security.Claims;
using TaskerApi.Models.Common;
using TaskerApi.Services.Interfaces;

namespace TaskerApi.Controllers;

/// <summary>
/// Контроллер авторизации и регистрации пользователей
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthService authService,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

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

                return BadRequest(ApiResponse<AuthResponse>.ErrorResult("Ошибка валидации", errors));
            }

            var result = await _authService.LoginAsync(request);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during login");
            return StatusCode(500, ApiResponse<AuthResponse>.ErrorResult("Внутренняя ошибка сервера"));
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

                return BadRequest(ApiResponse<RegisterResponse>.ErrorResult("Ошибка валидации", errors));
            }

            var result = await _authService.RegisterAsync(request);

            if (result.Success)
            {
                return CreatedAtAction(nameof(Register), result);
            }

            return BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during registration");
            return StatusCode(500, ApiResponse<RegisterResponse>.ErrorResult("Внутренняя ошибка сервера"));
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
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<RefreshTokenResponse>.ErrorResult("Ошибка валидации", errors));
            }

            var result = await _authService.RefreshTokenAsync(request);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during token refresh");
            return StatusCode(500, ApiResponse<RefreshTokenResponse>.ErrorResult("Внутренняя ошибка сервера"));
        }
    }

    /// <summary>
    /// Выход из системы
    /// </summary>
    /// <param name="request">Refresh токен для отзыва</param>
    /// <returns>Результат выхода</returns>
    /// <response code="200">Выход выполнен успешно</response>
    /// <response code="400">Неверный refresh токен</response>
    /// <response code="500">Внутренняя ошибка сервера</response>
    [HttpPost("logout")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<object>.ErrorResult("Ошибка валидации", errors));
            }

            var result = await _authService.LogoutAsync(request);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during logout");
            return StatusCode(500, ApiResponse<object>.ErrorResult("Внутренняя ошибка сервера"));
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
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return Unauthorized(ApiResponse<UserInfo>.ErrorResult("Токен доступа не предоставлен"));
            }

            var accessToken = authHeader.Substring("Bearer ".Length);

            var result = await _authService.GetUserInfoAsync(accessToken);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error getting current user info");
            return StatusCode(500, ApiResponse<UserInfo>.ErrorResult("Внутренняя ошибка сервера"));
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
            message = "Пользователь авторизован",
            timestamp = DateTime.UtcNow
        });
    }

    
}
