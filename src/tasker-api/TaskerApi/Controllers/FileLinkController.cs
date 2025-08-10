using Microsoft.AspNetCore.Mvc;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using AutoMapper;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FileLinkController : ControllerBase
{
    private readonly IFileLinkService _fileLinkService;
    private readonly IMapper _mapper;

    public FileLinkController(IFileLinkService fileLinkService, IMapper mapper)
    {
        _fileLinkService = fileLinkService;
        _mapper = mapper;
    }

    /// <summary>
    /// Связать файл с действием.
    /// </summary>
    [HttpPost("action")]
    public async Task<ActionResult> LinkFileToAction(
        [FromBody] LinkFileRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _fileLinkService.LinkFileToActionAsync(
                request.FileId, 
                request.TargetId, 
                cancellationToken);
            
            return Ok(new { message = "Файл успешно связан с действием" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Связать файл с задачей.
    /// </summary>
    [HttpPost("task")]
    public async Task<ActionResult> LinkFileToTask(
        [FromBody] LinkFileRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _fileLinkService.LinkFileToTaskAsync(
                request.FileId, 
                request.TargetId, 
                cancellationToken);
            
            return Ok(new { message = "Файл успешно связан с задачей" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Связать файл с областью.
    /// </summary>
    [HttpPost("area")]
    public async Task<ActionResult> LinkFileToArea(
        [FromBody] LinkFileRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _fileLinkService.LinkFileToAreaAsync(
                request.FileId, 
                request.TargetId, 
                cancellationToken);
            
            return Ok(new { message = "Файл успешно связан с областью" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Отвязать файл от действия.
    /// </summary>
    [HttpDelete("action")]
    public async Task<ActionResult> UnlinkFileFromAction(
        [FromBody] LinkFileRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _fileLinkService.UnlinkFileFromActionAsync(
                request.FileId, 
                request.TargetId, 
                cancellationToken);
            
            return Ok(new { message = "Файл успешно отвязан от действия" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Отвязать файл от задачи.
    /// </summary>
    [HttpDelete("task")]
    public async Task<ActionResult> UnlinkFileFromTask(
        [FromBody] LinkFileRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _fileLinkService.UnlinkFileFromTaskAsync(
                request.FileId, 
                request.TargetId, 
                cancellationToken);
            
            return Ok(new { message = "Файл успешно отвязан от задачи" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Отвязать файл от области.
    /// </summary>
    [HttpDelete("area")]
    public async Task<ActionResult> UnlinkFileFromArea(
        [FromBody] LinkFileRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _fileLinkService.UnlinkFileFromAreaAsync(
                request.FileId, 
                request.TargetId, 
                cancellationToken);
            
            return Ok(new { message = "Файл успешно отвязан от области" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Получить все файлы действия.
    /// </summary>
    [HttpGet("action/{actionId:guid}/files")]
    public async Task<ActionResult<IEnumerable<FileLinkResponse>>> GetFilesForAction(
        Guid actionId,
        CancellationToken cancellationToken = default)
    {
        var files = await _fileLinkService.GetFilesForActionAsync(actionId, cancellationToken);
        var responses = _mapper.Map<IEnumerable<FileLinkResponse>>(files);
        return Ok(responses);
    }

    /// <summary>
    /// Получить все файлы задачи.
    /// </summary>
    [HttpGet("task/{taskId:guid}/files")]
    public async Task<ActionResult<IEnumerable<FileLinkResponse>>> GetFilesForTask(
        Guid taskId,
        CancellationToken cancellationToken = default)
    {
        var files = await _fileLinkService.GetFilesForTaskAsync(taskId, cancellationToken);
        var responses = _mapper.Map<IEnumerable<FileLinkResponse>>(files);
        return Ok(responses);
    }

    /// <summary>
    /// Получить все файлы области.
    /// </summary>
    [HttpGet("area/{areaId:guid}/files")]
    public async Task<ActionResult<IEnumerable<FileLinkResponse>>> GetFilesForArea(
        Guid areaId,
        CancellationToken cancellationToken = default)
    {
        var files = await _fileLinkService.GetFilesForAreaAsync(areaId, cancellationToken);
        var responses = _mapper.Map<IEnumerable<FileLinkResponse>>(files);
        return Ok(responses);
    }

    /// <summary>
    /// Получить статистику по файлам области.
    /// </summary>
    [HttpGet("area/{areaId:guid}/statistics")]
    public async Task<ActionResult<FileAreaStatisticsResponse>> GetFileAreaStatistics(
        Guid areaId,
        CancellationToken cancellationToken = default)
    {
        var statistics = await _fileLinkService.GetFileAreaStatisticsAsync(areaId, cancellationToken);
        var response = _mapper.Map<FileAreaStatisticsResponse>(statistics);
        return Ok(response);
    }
}
