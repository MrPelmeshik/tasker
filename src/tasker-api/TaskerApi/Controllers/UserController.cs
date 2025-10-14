using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskerApi.Attributes;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Models.Entities;

namespace TaskerApi.Controllers;

/// <summary>
/// Контроллер для работы с пользователями (пример использования репозиториев)
/// </summary>
[ApiController]
[Route("api/[controller]/[action]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserController> _logger;

    public UserController(IUserRepository userRepository, ILogger<UserController> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    /// <summary>
    /// Получить всех пользователей
    /// </summary>
    [HttpGet]
    [UserLog("Получение списка пользователей")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        try
        {
            var users = await _userRepository.GetAllAsync(cancellationToken);
            return Ok(users);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Ошибка при получении списка пользователей");
            return BadRequest(e.Message);
        }
    }

    /// <summary>
    /// Получить пользователя по ID
    /// </summary>
    [HttpGet("{id}")]
    [UserLog("Получение пользователя по идентификатору")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(id, cancellationToken);
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
    /// Получить пользователя по имени
    /// </summary>
    [HttpGet("by-name/{name}")]
    [UserLog("Получение пользователя по имени")]
    public async Task<IActionResult> GetByName(string name, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userRepository.GetByNameAsync(name, cancellationToken);
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
    /// Получить пользователя по email
    /// </summary>
    [HttpGet("by-email/{email}")]
    [UserLog("Получение пользователя по email")]
    public async Task<IActionResult> GetByEmail(string email, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
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
    /// Создать пользователя
    /// </summary>
    [HttpPost]
    [UserLog("Создание пользователя")]
    public async Task<IActionResult> Create([FromBody] UserEntity user, CancellationToken cancellationToken)
    {
        try
        {
            var createdUser = await _userRepository.CreateAsync(user, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = createdUser.Id }, createdUser);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Ошибка при создании пользователя");
            return BadRequest(e.Message);
        }
    }

    /// <summary>
    /// Обновить пользователя
    /// </summary>
    [HttpPut("{id}")]
    [UserLog("Обновление пользователя")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UserEntity user, CancellationToken cancellationToken)
    {
        try
        {
            if (id != user.Id)
            {
                return BadRequest("ID в URL не совпадает с ID в теле запроса");
            }

            var updatedUser = await _userRepository.UpdateAsync(user, cancellationToken);
            return Ok(updatedUser);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Ошибка при обновлении пользователя {UserId}", id);
            return BadRequest(e.Message);
        }
    }

    /// <summary>
    /// Удалить пользователя
    /// </summary>
    [HttpDelete("{id}")]
    [UserLog("Удаление пользователя")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var deletedCount = await _userRepository.DeleteAsync(id, cancellationToken);
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
    /// Получить количество пользователей
    /// </summary>
    [HttpGet("count")]
    [UserLog("Получение количества пользователей")]
    public async Task<IActionResult> GetCount(CancellationToken cancellationToken)
    {
        try
        {
            var count = await _userRepository.CountAsync(cancellationToken: cancellationToken);
            return Ok(new { count });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Ошибка при получении количества пользователей");
            return BadRequest(e.Message);
        }
    }
}
