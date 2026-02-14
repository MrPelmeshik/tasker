using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using TaskerApi.Attributes;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EventController(
    IEventAreaService eventAreaService,
    IEventTaskService eventTaskService,
    ILogger<EventController> logger,
    IWebHostEnvironment env) : BaseApiController(logger, env)
{
    [HttpPost("addByTask")]
    [UserLog("Добавление события по задаче")]
    public Task<IActionResult> AddEventByTask([FromBody] EventCreateEntityRequest item, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await eventTaskService.AddEventAsync(item, cancellationToken)));

    [HttpPost("addByArea")]
    [UserLog("Добавление события по области")]
    public Task<IActionResult> AddEventByArea([FromBody] EventCreateEntityRequest item, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await eventAreaService.AddEventAsync(item, cancellationToken)));

    [HttpGet("byTask/{taskId:guid}")]
    [UserLog("Получение событий по задаче")]
    public Task<IActionResult> GetEventsByTask(Guid taskId, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await eventTaskService.GetEventsByTaskIdAsync(taskId, cancellationToken)));

    [HttpGet("byArea/{areaId:guid}")]
    [UserLog("Получение событий по области")]
    public Task<IActionResult> GetEventsByArea(Guid areaId, CancellationToken cancellationToken)
        => ExecuteWithExceptionHandling(async () => Ok(await eventAreaService.GetEventsByAreaIdAsync(areaId, cancellationToken)));
}
