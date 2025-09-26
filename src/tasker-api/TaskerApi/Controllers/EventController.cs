using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Requests.Base;
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
    [HttpPost]
    public async Task<EventCreateResponse> AddEventByTask([FromBody] EventCreateEntityRequest item, CancellationToken cancellationToken)
    {
        return await eventTaskService.AddEventAsync(item, cancellationToken);
    }
    
    [HttpPost]
    public async Task<EventCreateResponse> AddEventByGroup([FromBody] EventCreateEntityRequest item, CancellationToken cancellationToken)
    {
        return await eventGroupService.AddEventAsync(item, cancellationToken);
    }
    
    [HttpPost]
    public async Task<EventCreateResponse> AddEventByArea([FromBody] EventCreateEntityRequest item, CancellationToken cancellationToken)
    {
        return await eventAreaService.AddEventAsync(item, cancellationToken);
    }
}