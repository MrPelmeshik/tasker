using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskerApi.Attributes;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Requests;

namespace TaskerApi.Controllers;

/// <summary>
/// Контроллер для работы с пользователями.
/// </summary>
[ApiController]
[Route("api/[controller]/[action]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UserController> _logger;

    public UserController(IUserService userService, ILogger<UserController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    /// <summary>
    /// Получить всех пользователей.
    /// </summary>
    [HttpGet]
    [UserLog("Получение списка пользователей")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        try
        {
            var users = await _userService.GetAllAsync(cancellationToken);
            return Ok(users);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Ошибка при получении списка пользователей");
            return BadRequest(e.Message);
        }
    }

    /// <summary>
    /// Получить пользователя по ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [UserLog("Получение пользователя по идентификатору")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userService.GetByIdAsync(id, cancellationToken);
            if (user == null)
            {
                return NotFound("Пользователь не найден");
            }
            return Ok(user);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Ошибка при получении пользователя {UserId}", id);
            return BadRequest(e.Message);
        }
    }

    /// <summary>
    /// Получить пользователя по имени.
    /// </summary>
    [HttpGet("by-name/{name}")]
    [UserLog("Получение пользователя по имени")]
    public async Task<IActionResult> GetByName(string name, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userService.GetByNameAsync(name, cancellationToken);
            if (user == null)
            {
                return NotFound("Пользователь не найден");
            }
            return Ok(user);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Ошибка при получении пользователя по имени {UserName}", name);
            return BadRequest(e.Message);
        }
    }

    /// <summary>
    /// Получить пользователя по email.
    /// </summary>
    [HttpGet("by-email/{email}")]
    [UserLog("Получение пользователя по email")]
    public async Task<IActionResult> GetByEmail(string email, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userService.GetByEmailAsync(email, cancellationToken);
            if (user == null)
            {
                return NotFound("Пользователь не найден");
            }
            return Ok(user);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Ошибка при получении пользователя по email {Email}", email);
            return BadRequest(e.Message);
        }
    }

    /// <summary>
    /// Создать пользователя.
    /// </summary>
    [HttpPost]
    [UserLog("Создание пользователя")]
    public async Task<IActionResult> Create([FromBody] UserCreateRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        try
        {
            var createdUser = await _userService.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = createdUser.Id }, createdUser);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Ошибка при создании пользователя");
            return BadRequest(e.Message);
        }
    }

    /// <summary>
    /// Обновить пользователя.
    /// </summary>
    [HttpPut("{id:guid}")]
    [UserLog("Обновление пользователя")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UserUpdateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updatedUser = await _userService.UpdateAsync(id, request, cancellationToken);
            return Ok(updatedUser);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Ошибка при обновлении пользователя {UserId}", id);
            return BadRequest(e.Message);
        }
    }

    /// <summary>
    /// Удалить пользователя.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [UserLog("Удаление пользователя")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var deletedCount = await _userService.DeleteAsync(id, cancellationToken);
            if (deletedCount == 0)
            {
                return NotFound("Пользователь не найден");
            }
            return Ok(new { success = true, message = "Пользователь успешно удален" });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Ошибка при удалении пользователя {UserId}", id);
            return BadRequest(e.Message);
        }
    }

    /// <summary>
    /// Получить количество пользователей.
    /// </summary>
    [HttpGet("count")]
    [UserLog("Получение количества пользователей")]
    public async Task<IActionResult> GetCount(CancellationToken cancellationToken)
    {
        try
        {
            var count = await _userService.CountAsync(cancellationToken);
            return Ok(new { count });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Ошибка при получении количества пользователей");
            return BadRequest(e.Message);
        }
    }
}
