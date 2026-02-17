using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Controllers;

[Authorize]
[ApiController]
[Route("api/attachments")]
public class AttachmentController : ControllerBase
{
    private readonly IAttachmentService _attachmentService;
    private readonly ICurrentUserService _currentUserService;

    public AttachmentController(IAttachmentService attachmentService, ICurrentUserService currentUserService)
    {
        _attachmentService = attachmentService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Загрузить файл для сущности.
    /// </summary>
    [HttpPost("{entityType}/{entityId}")]
    public async Task<ActionResult<AttachmentEntity>> Upload(
        [FromRoute] EntityType entityType, 
        [FromRoute] Guid entityId, 
        IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("Файл не выбран");
        }

        var userId = _currentUserService.UserId;
        var attachment = await _attachmentService.UploadAsync(entityId, entityType, file, userId);
        
        return Ok(attachment);
    }

    /// <summary>
    /// Получить список вложений для сущности.
    /// </summary>
    [HttpGet("{entityType}/{entityId}")]
    public async Task<ActionResult<List<AttachmentEntity>>> GetList(
        [FromRoute] EntityType entityType, 
        [FromRoute] Guid entityId)
    {
        var userId = _currentUserService.UserId;
        var attachments = await _attachmentService.GetListAsync(entityId, entityType, userId);
        
        return Ok(attachments);
    }

    /// <summary>
    /// Скачать файл.
    /// </summary>
    [HttpGet("{id}/download")]
    public async Task<IActionResult> Download([FromRoute] Guid id)
    {
        var userId = _currentUserService.UserId;
        var (fileStream, contentType, downloadName) = await _attachmentService.DownloadAsync(id, userId);
        
        return File(fileStream, contentType, downloadName);
    }

    /// <summary>
    /// Удалить вложение.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        var userId = _currentUserService.UserId;
        await _attachmentService.DeleteAsync(id, userId);
        
        return NoContent();
    }
}
