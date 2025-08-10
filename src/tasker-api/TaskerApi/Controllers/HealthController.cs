using Microsoft.AspNetCore.Mvc;

namespace TaskerApi.Controllers;

/// <summary>
/// Контроллер проверки доступности.
/// </summary>
[ApiController]
[Route("health")] 
public class HealthController : ControllerBase
{
    /// <summary>
    /// Проверка состояния сервиса.
    /// </summary>
    [HttpGet]
    public IActionResult Get() => Ok(new { status = "ok" });
}


