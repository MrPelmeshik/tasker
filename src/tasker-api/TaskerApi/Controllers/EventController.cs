using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EventController(
    IEventAreaService eventAreaService,
    IEventTaskService eventTaskService) : BaseApiController
{
    [HttpPost("addByTask")]
    public Task<IActionResult> AddEventByTask([FromBody] EventCreateEntityRequest item, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await eventTaskService.AddEventAsync(item, cancellationToken)));

    [HttpPost("addByArea")]
    public Task<IActionResult> AddEventByArea([FromBody] EventCreateEntityRequest item, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await eventAreaService.AddEventAsync(item, cancellationToken)));

    /// <summary>
    /// Получить список событий по идентификатору задачи
    /// </summary>
    [HttpGet("byTask/{taskId:guid}")]
    public Task<IActionResult> GetEventsByTask(Guid taskId, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await eventTaskService.GetEventsByTaskIdAsync(taskId, cancellationToken)));

    /// <summary>
    /// Получить список событий по идентификатору области
    /// </summary>
    [HttpGet("byArea/{areaId:guid}")]
    public Task<IActionResult> GetEventsByArea(Guid areaId, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await eventAreaService.GetEventsByAreaIdAsync(areaId, cancellationToken)));
}
