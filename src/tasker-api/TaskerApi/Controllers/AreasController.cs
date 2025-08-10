using Microsoft.AspNetCore.Mvc;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Responses;
using TaskerApi.Models.Requests;
using AutoMapper;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AreasController : ControllerBase
{
    private readonly IAreaService _areaService;
    private readonly IMapper _mapper;

    public AreasController(IAreaService areaService, IMapper mapper)
    {
        _areaService = areaService;
        _mapper = mapper;
    }

    /// <summary>
    /// Получить все области.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AreaResponse>>> GetAreas(
        CancellationToken cancellationToken = default)
    {
        var areas = await _areaService.GetAllAsync(cancellationToken);
        var responses = _mapper.Map<IEnumerable<AreaResponse>>(areas);
        return Ok(responses);
    }

    /// <summary>
    /// Получить область по ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AreaResponse>> GetArea(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var area = await _areaService.GetByIdAsync(id, cancellationToken);
        if (area == null)
            return NotFound();

        var response = _mapper.Map<AreaResponse>(area);
        return Ok(response);
    }

    /// <summary>
    /// Создать новую область.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<AreaResponse>> CreateArea(
        [FromBody] CreateAreaRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var area = await _areaService.CreateAsync(request, cancellationToken);
            var response = _mapper.Map<AreaResponse>(area);
            return CreatedAtAction(nameof(GetArea), new { id = area.Id }, response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Обновить область.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<AreaResponse>> UpdateArea(
        Guid id,
        [FromBody] UpdateAreaRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var area = await _areaService.UpdateAsync(id, request, cancellationToken);
            var response = _mapper.Map<AreaResponse>(area);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Удалить область.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteArea(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _areaService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Получить статистику по области.
    /// </summary>
    [HttpGet("{id:guid}/statistics")]
    public async Task<ActionResult<AreaStatisticsResponse>> GetAreaStatistics(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var statistics = await _areaService.GetStatisticsAsync(id, cancellationToken);
        var response = _mapper.Map<AreaStatisticsResponse>(statistics);
        return Ok(response);
    }
}




