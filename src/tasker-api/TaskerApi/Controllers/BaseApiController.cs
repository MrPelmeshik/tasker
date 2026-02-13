using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace TaskerApi.Controllers;

/// <summary>
/// Базовый контроллер API с унифицированной обработкой исключений.
/// </summary>
[ApiController]
public abstract class BaseApiController : ControllerBase
{
    /// <summary>
    /// Выполняет операцию с маппингом исключений в соответствующие ActionResult.
    /// </summary>
    /// <param name="operation">Операция, возвращающая ActionResult</param>
    /// <returns>Результат операции или ActionResult при исключении</returns>
    protected async Task<IActionResult> ExecuteWithExceptionHandling(Func<Task<IActionResult>> operation)
    {
        try
        {
            return await operation();
        }
        catch (KeyNotFoundException ex)
        {
            var logger = HttpContext.RequestServices.GetRequiredService<ILogger<BaseApiController>>();
            logger.LogWarning(ex, "Ресурс не найден");
            var env = HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();
            return NotFound(env.IsProduction() ? "Ресурс не найден" : ex.Message);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            var logger = HttpContext.RequestServices.GetRequiredService<ILogger<BaseApiController>>();
            logger.LogWarning(ex, "InvalidOperationException");
            var env = HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();
            if (env.IsProduction())
            {
                if (ex.Message.Contains("не найден", StringComparison.OrdinalIgnoreCase) ||
                    ex.Message.Contains("не найдена", StringComparison.OrdinalIgnoreCase))
                    return NotFound("Ресурс не найден");
                return BadRequest("Операция недоступна");
            }
            if (ex.Message.Contains("не найден", StringComparison.OrdinalIgnoreCase) ||
                ex.Message.Contains("не найдена", StringComparison.OrdinalIgnoreCase))
                return NotFound(ex.Message);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            var logger = HttpContext.RequestServices.GetRequiredService<ILogger<BaseApiController>>();
            logger.LogError(ex, "Необработанное исключение");
            var env = HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();
            if (env.IsProduction())
            {
                return StatusCode(500, "Произошла внутренняя ошибка");
            }
            return BadRequest(ex.Message);
        }
    }
}
