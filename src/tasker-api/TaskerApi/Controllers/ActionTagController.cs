using Microsoft.AspNetCore.Mvc;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Responses;
using TaskerApi.Models.Requests;
using AutoMapper;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActionTagController : ControllerBase
{
    private readonly IActionTagService _actionTagService;
    private readonly IMapper _mapper;

    public ActionTagController(IActionTagService actionTagService, IMapper mapper)
    {
        _actionTagService = actionTagService;
        _mapper = mapper;
    }

    /// <summary>
    /// Добавить тег к действию.
    /// </summary>
    [HttpPost("add")]
    public async Task<ActionResult> AddTagToAction(
        [FromBody] AddTagToActionRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _actionTagService.AddTagToActionAsync(
                request.ActionId, 
                request.TagId, 
                cancellationToken);
            
            return Ok(new { message = "Тег успешно добавлен к действию" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Удалить тег из действия.
    /// </summary>
    [HttpDelete("remove")]
    public async Task<ActionResult> RemoveTagFromAction(
        [FromBody] AddTagToActionRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _actionTagService.RemoveTagFromActionAsync(
                request.ActionId, 
                request.TagId, 
                cancellationToken);
            
            return Ok(new { message = "Тег успешно удален из действия" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Получить все теги для действия.
    /// </summary>
    [HttpGet("action/{actionId:guid}/tags")]
    public async Task<ActionResult<IEnumerable<TagResponse>>> GetTagsForAction(
        Guid actionId,
        CancellationToken cancellationToken = default)
    {
        var tags = await _actionTagService.GetTagsForActionAsync(actionId, cancellationToken);
        var responses = _mapper.Map<IEnumerable<TagResponse>>(tags);
        return Ok(responses);
    }

    /// <summary>
    /// Получить все действия для тега.
    /// </summary>
    [HttpGet("tag/{tagId:guid}/actions")]
    public async Task<ActionResult<IEnumerable<ActionResponse>>> GetActionsForTag(
        Guid tagId,
        CancellationToken cancellationToken = default)
    {
        var actions = await _actionTagService.GetActionsForTagAsync(tagId, cancellationToken);
        var responses = _mapper.Map<IEnumerable<ActionResponse>>(actions);
        return Ok(responses);
    }

    /// <summary>
    /// Получить статистику по тегу.
    /// </summary>
    [HttpGet("tag/{tagId:guid}/statistics")]
    public async Task<ActionResult<TagStatisticsResponse>> GetTagStatistics(
        Guid tagId,
        CancellationToken cancellationToken = default)
    {
        var statistics = await _actionTagService.GetTagStatisticsAsync(tagId, cancellationToken);
        var response = _mapper.Map<TagStatisticsResponse>(statistics);
        return Ok(response);
    }

    /// <summary>
    /// Получить статистику использования тегов.
    /// </summary>
    [HttpGet("usage-statistics")]
    public async Task<ActionResult<IEnumerable<TagUsageResponse>>> GetTagUsageStatistics(
        CancellationToken cancellationToken = default)
    {
        var usage = await _actionTagService.GetTagUsageStatisticsAsync(cancellationToken);
        var responses = _mapper.Map<IEnumerable<TagUsageResponse>>(usage);
        return Ok(responses);
    }
}
