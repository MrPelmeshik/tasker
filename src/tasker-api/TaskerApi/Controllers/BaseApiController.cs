using Microsoft.AspNetCore.Mvc;

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
            return NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("не найден", StringComparison.OrdinalIgnoreCase) ||
                ex.Message.Contains("не найдена", StringComparison.OrdinalIgnoreCase))
                return NotFound(ex.Message);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
