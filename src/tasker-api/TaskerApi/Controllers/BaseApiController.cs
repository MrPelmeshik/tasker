using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskerApi.Constants;

namespace TaskerApi.Controllers;

/// <summary>
/// Базовый контроллер API с унифицированной обработкой исключений.
/// </summary>
[ApiController]
public abstract class BaseApiController : ControllerBase
{
    private readonly ILogger _logger;
    private readonly IWebHostEnvironment _env;

    /// <summary>Выполняет операцию с маппингом исключений в ActionResult (404/403/400/500).</summary>
    protected async Task<IActionResult> ExecuteWithExceptionHandling(Func<Task<IActionResult>> operation)
    {
        try
        {
            return await operation();
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Ресурс не найден");
            return NotFound(_env.IsProduction() ? ErrorMessages.NotFoundGeneric : ex.Message);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "ArgumentException");
            return BadRequest(_env.IsProduction() ? ErrorMessages.OperationUnavailable : ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "InvalidOperationException");
            if (_env.IsProduction())
            {
                if (ErrorMessages.IsNotFound(ex.Message))
                    return NotFound(ErrorMessages.NotFoundGeneric);
                return BadRequest(ErrorMessages.OperationUnavailable);
            }
            if (ErrorMessages.IsNotFound(ex.Message))
                return NotFound(ex.Message);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Необработанное исключение");
            if (_env.IsProduction())
                return StatusCode(500, ErrorMessages.InternalError);
            return BadRequest(ex.Message);
        }
    }

    protected BaseApiController(ILogger logger, IWebHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }
}
