using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskerApi.Interfaces.Services;

namespace TaskerApi.Controllers;

/// <summary>
/// Контроллер для проверки Windows-аутентификации (Negotiate)
/// </summary>
[ApiController]
[Route("api/windows-auth")]
[Produces("application/json")]
public class WindowsAuthController(IUserService userService) : ControllerBase
{
    /// <summary>
    /// Возвращает текущую Windows-учетную запись пользователя
    /// </summary>
    /// <returns>Имя и клеймы пользователя</returns>
    [HttpGet("me")]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.Negotiate.NegotiateDefaults.AuthenticationScheme)]
    [ProducesResponseType(typeof(object), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var identityName = User.Identity?.Name ?? string.Empty; // DOMAIN\\username
        if (string.IsNullOrWhiteSpace(identityName))
            return Unauthorized();

        var user = await userService.GetOrCreateByWindowsIdentityAsync(identityName, cancellationToken);
        var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
        return Ok(new {
            name = identityName,
            user,
            claims
        });
    }
}


