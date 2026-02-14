using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using TaskerApi.Attributes;
using TaskerApi.Constants;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Requests;

namespace TaskerApi.Controllers;

/// <summary>
/// Контроллер для работы с пользователями.
/// </summary>
[ApiController]
[Route("api/[controller]/[action]")]
[Authorize]
public class UserController(IUserService service, ILogger<UserController> logger, IWebHostEnvironment env) : BaseApiController(logger, env)
{
    [HttpGet]
    [UserLog("Получение списка пользователей")]
    public Task<IActionResult> GetAll(CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await service.GetAllAsync(cancellationToken)));

    [HttpGet("{id:guid}")]
    [UserLog("Получение пользователя по идентификатору")]
    public Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () =>
        {
            var user = await service.GetByIdAsync(id, cancellationToken);
            if (user == null)
                return NotFound(ErrorMessages.UserNotFound);
            return Ok(user);
        });

    [HttpGet("by-name/{name}")]
    [UserLog("Получение пользователя по имени")]
    public Task<IActionResult> GetByName(string name, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () =>
        {
            var user = await service.GetByNameAsync(name, cancellationToken);
            if (user == null)
                return NotFound(ErrorMessages.UserNotFound);
            return Ok(user);
        });

    [HttpGet("by-email/{email}")]
    [UserLog("Получение пользователя по email")]
    public Task<IActionResult> GetByEmail(string email, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () =>
        {
            var user = await service.GetByEmailAsync(email, cancellationToken);
            if (user == null)
                return NotFound(ErrorMessages.UserNotFound);
            return Ok(user);
        });

    [HttpPost]
    [UserLog("Создание пользователя")]
    public Task<IActionResult> Create([FromBody] UserCreateRequest request, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () =>
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var createdUser = await service.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = createdUser.Id }, createdUser);
        });

    [HttpPut("{id:guid}")]
    [UserLog("Обновление пользователя")]
    public Task<IActionResult> Update(Guid id, [FromBody] UserUpdateRequest request, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () =>
        {
            var updatedUser = await service.UpdateAsync(id, request, cancellationToken);
            return Ok(updatedUser);
        });

    [HttpDelete("{id:guid}")]
    [UserLog("Удаление пользователя")]
    public Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () =>
        {
            var deletedCount = await service.DeleteAsync(id, cancellationToken);
            if (deletedCount == 0)
                return NotFound(ErrorMessages.UserNotFound);
            return Ok(new { success = true, message = SuccessMessages.UserDeleted });
        });

    [HttpGet("count")]
    [UserLog("Получение количества пользователей")]
    public Task<IActionResult> GetCount(CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(new { count = await service.CountAsync(cancellationToken) }));
}
