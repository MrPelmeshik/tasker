using Microsoft.AspNetCore.Mvc;
using TaskerApi.Attributes;

namespace TaskerApi.Controllers;

/// <summary>
/// Контроллер проверки доступности.
/// </summary>
[ApiController]
[Route("api/[controller]")] 
public class HealthController : ControllerBase
{
    /// <summary>
    /// Проверка состояния сервиса.
    /// </summary>
    [HttpGet]
    [UserLog("Проверка состояния сервиса")]
    public IActionResult Get() => Ok(new { status = "ok" });
}


