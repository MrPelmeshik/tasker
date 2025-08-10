using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskerApi.Attributes;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using AutoMapper;

namespace TaskerApi.Controllers;

/// <summary>
/// Контроллер для управления файлами.
/// </summary>
[ApiController]
[Route("api/files")]
[Authorize]
public class FilesController : ControllerBase
{
    private readonly IFileService _service;
    private readonly IMapper _mapper;

    public FilesController(IFileService service, IMapper mapper)
    {
        _service = service;
        _mapper = mapper;
    }

    /// <summary>
    /// Получить файл по идентификатору.
    /// </summary>
    [HttpGet("{id:guid}")]
    [UserActionLog("Получение файла по идентификатору")]
    public async Task<ActionResult<FileResponse>> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var entity = await _service.GetAsync(id, cancellationToken);
        if (entity == null)
            return NotFound();

        return Ok(_mapper.Map<FileResponse>(entity));
    }

    /// <summary>
    /// Получить файлы пользователя.
    /// </summary>
    [HttpGet("user/{userId:guid}")]
    [UserActionLog("Получение файлов пользователя")]
    public async Task<ActionResult<IEnumerable<FileResponse>>> GetByUser([FromRoute] Guid userId, CancellationToken cancellationToken)
    {
        var entities = await _service.GetByUserAsync(userId, cancellationToken);
        var responses = _mapper.Map<IEnumerable<FileResponse>>(entities);
        return Ok(responses);
    }

    /// <summary>
    /// Получить файлы области.
    /// </summary>
    [HttpGet("area/{areaId:guid}")]
    [UserActionLog("Получение файлов области")]
    public async Task<ActionResult<IEnumerable<FileResponse>>> GetByArea([FromRoute] Guid areaId, CancellationToken cancellationToken)
    {
        var entities = await _service.GetByAreaAsync(areaId, cancellationToken);
        var responses = _mapper.Map<IEnumerable<FileResponse>>(entities);
        return Ok(responses);
    }

    /// <summary>
    /// Получить файлы задачи.
    /// </summary>
    [HttpGet("task/{taskId:guid}")]
    [UserActionLog("Получение файлов задачи")]
    public async Task<ActionResult<IEnumerable<FileResponse>>> GetByTask([FromRoute] Guid taskId, CancellationToken cancellationToken)
    {
        var entities = await _service.GetByTaskAsync(taskId, cancellationToken);
        var responses = _mapper.Map<IEnumerable<FileResponse>>(entities);
        return Ok(responses);
    }

    /// <summary>
    /// Получить файлы действия.
    /// </summary>
    [HttpGet("action/{actionId:guid}")]
    [UserActionLog("Получение файлов действия")]
    public async Task<ActionResult<IEnumerable<FileResponse>>> GetByAction([FromRoute] Guid actionId, CancellationToken cancellationToken)
    {
        var entities = await _service.GetByActionAsync(actionId, cancellationToken);
        var responses = _mapper.Map<IEnumerable<FileResponse>>(entities);
        return Ok(responses);
    }

    /// <summary>
    /// Создать новый файл.
    /// </summary>
    [HttpPost]
    [UserActionLog("Создание нового файла")]
    public async Task<ActionResult<FileResponse>> Create([FromBody] CreateFileRequest request, CancellationToken cancellationToken)
    {
        var entity = new FileEntity
        {
            Filename = request.Filename,
            MimeType = request.MimeType,
            ByteSize = request.ByteSize,
            StorageUrl = request.StorageUrl,
            UserId = request.UserId,
            IsActive = true,
            Created = DateTimeOffset.UtcNow
        };
        var id = await _service.CreateAsync(entity, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id }, _mapper.Map<FileResponse>(entity));
    }

    /// <summary>
    /// Обновить файл.
    /// </summary>
    [HttpPut("{id:guid}")]
    [UserActionLog("Обновление файла")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateFileRequest request, CancellationToken cancellationToken)
    {
        var entity = await _service.GetAsync(id, cancellationToken);
        if (entity == null) 
            return NotFound();

        entity.Filename = request.Filename;
        entity.MimeType = request.MimeType;
        entity.ByteSize = request.ByteSize;
        entity.IsActive = request.IsActive;
        await _service.UpdateAsync(entity, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Удалить файл.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [UserActionLog("Удаление файла")]
    public async Task<IActionResult> Delete([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        await _service.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
