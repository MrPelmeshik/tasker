using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskerApi.Attributes;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
[Authorize]
public class FolderController(IFolderService service) : BaseApiController
{
    [HttpGet]
    [UserLog("Получение списка папок")]
    public Task<IActionResult> GetAll(CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await service.GetAsync(cancellationToken)));

    [HttpGet("{id}")]
    [UserLog("Получение папки по идентификатору")]
    public Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () =>
        {
            var result = await service.GetByIdAsync(id, cancellationToken);
            if (result == null)
                return NotFound("Папка не найдена");
            return Ok(result);
        });

    [HttpPost]
    [UserLog("Создание папки")]
    public Task<IActionResult> Create([FromBody] FolderCreateRequest item, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await service.CreateAsync(item, cancellationToken)));

    [HttpPut("{id}")]
    [UserLog("Обновление папки")]
    public Task<IActionResult> Update(Guid id, [FromBody] FolderUpdateRequest item, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () =>
        {
            await service.UpdateAsync(id, item, cancellationToken);
            return Ok(new { success = true, message = "Папка успешно обновлена" });
        });

    /// <summary>
    /// Удалить папку (мягкое удаление — деактивация)
    /// </summary>
    [HttpDelete("{id}")]
    [UserLog("Удаление папки")]
    public Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () =>
        {
            await service.DeleteAsync(id, cancellationToken);
            return Ok(new { success = true, message = "Папка успешно удалена" });
        });

    [HttpGet("root/{areaId}")]
    [UserLog("Получение корневых папок по области")]
    public Task<IActionResult> GetRootByArea(Guid areaId, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await service.GetRootByAreaAsync(areaId, cancellationToken)));

    [HttpGet("children")]
    [UserLog("Получение подпапок по родительской папке")]
    public Task<IActionResult> GetByParent([FromQuery] Guid? parentFolderId, [FromQuery] Guid areaId, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await service.GetByParentAsync(parentFolderId, areaId, cancellationToken)));
}
