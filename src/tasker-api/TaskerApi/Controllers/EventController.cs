using Microsoft.AspNetCore.Mvc;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Services.Interfaces;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventController(IEventService service) : ControllerBase
{
    [HttpPost]
    public async Task<EventCreateResponse> CreateByAreaAsync(EventCreateByAreaRequest item, CancellationToken cancellationToken)
    {
        return await service.CreateAsync(item, cancellationToken);
    }
    
    [HttpPost]
    public async Task<EventCreateResponse> CreateByGroupAsync(EventCreateByGroupRequest item, CancellationToken cancellationToken)
    {
        return await service.CreateAsync(item, cancellationToken);
    }
}