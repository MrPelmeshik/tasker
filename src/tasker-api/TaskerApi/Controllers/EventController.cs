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
    IEventGroupService eventGroupService,
    IEventTaskService eventTaskService) : ControllerBase
{
    [HttpPost("addByTask")]
    public async Task<EventCreateResponse> AddEventByTask([FromBody] EventCreateEntityRequest item, CancellationToken cancellationToken)
    {
        return await eventTaskService.AddEventAsync(item, cancellationToken);
    }
    
    [HttpPost("addByGroup")]
    public async Task<EventCreateResponse> AddEventByGroup([FromBody] EventCreateEntityRequest item, CancellationToken cancellationToken)
    {
        return await eventGroupService.AddEventAsync(item, cancellationToken);
    }
    
    [HttpPost("addByArea")]
    public async Task<EventCreateResponse> AddEventByArea([FromBody] EventCreateEntityRequest item, CancellationToken cancellationToken)
    {
        return await eventAreaService.AddEventAsync(item, cancellationToken);
    }

    /// <summary>
    /// Получить список событий по идентификатору задачи
    /// </summary>
    [HttpGet("byTask/{taskId:guid}")]
    public async Task<IReadOnlyList<EventResponse>> GetEventsByTask(Guid taskId, CancellationToken cancellationToken)
    {
        return await eventTaskService.GetEventsByTaskIdAsync(taskId, cancellationToken);
    }

    /// <summary>
    /// Получить список событий по идентификатору группы
    /// </summary>
    [HttpGet("byGroup/{groupId:guid}")]
    public async Task<IReadOnlyList<EventResponse>> GetEventsByGroup(Guid groupId, CancellationToken cancellationToken)
    {
        return await eventGroupService.GetEventsByGroupIdAsync(groupId, cancellationToken);
    }

    /// <summary>
    /// Получить список событий по идентификатору области
    /// </summary>
    [HttpGet("byArea/{areaId:guid}")]
    public async Task<IReadOnlyList<EventResponse>> GetEventsByArea(Guid areaId, CancellationToken cancellationToken)
    {
        return await eventAreaService.GetEventsByAreaIdAsync(areaId, cancellationToken);
    }
}