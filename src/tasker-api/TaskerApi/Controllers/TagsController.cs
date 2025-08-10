using Microsoft.AspNetCore.Mvc;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Responses;
using TaskerApi.Models.Requests;
using AutoMapper;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly ITagService _tagService;
    private readonly IMapper _mapper;

    public TagsController(ITagService tagService, IMapper mapper)
    {
        _tagService = tagService;
        _mapper = mapper;
    }

    /// <summary>
    /// Получить все теги.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TagResponse>>> GetTags(
        CancellationToken cancellationToken = default)
    {
        var tags = await _tagService.GetAllAsync(cancellationToken);
        var responses = _mapper.Map<IEnumerable<TagResponse>>(tags);
        return Ok(responses);
    }

    /// <summary>
    /// Получить тег по ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TagResponse>> GetTag(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var tag = await _tagService.GetByIdAsync(id, cancellationToken);
        if (tag == null)
            return NotFound();

        var response = _mapper.Map<TagResponse>(tag);
        return Ok(response);
    }

    /// <summary>
    /// Создать новый тег.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TagResponse>> CreateTag(
        [FromBody] CreateTagRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var tag = await _tagService.CreateAsync(request, cancellationToken);
            var response = _mapper.Map<TagResponse>(tag);
            return CreatedAtAction(nameof(GetTag), new { id = tag.Id }, response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Обновить тег.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TagResponse>> UpdateTag(
        Guid id,
        [FromBody] UpdateTagRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var tag = await _tagService.UpdateAsync(id, request, cancellationToken);
            var response = _mapper.Map<TagResponse>(tag);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Удалить тег.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteTag(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _tagService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Получить теги по области.
    /// </summary>
    [HttpGet("area/{areaId:guid}")]
    public async Task<ActionResult<IEnumerable<TagResponse>>> GetTagsByArea(
        Guid areaId,
        CancellationToken cancellationToken = default)
    {
        var tags = await _tagService.GetByAreaAsync(areaId, cancellationToken);
        var responses = _mapper.Map<IEnumerable<TagResponse>>(tags);
        return Ok(responses);
    }
}
