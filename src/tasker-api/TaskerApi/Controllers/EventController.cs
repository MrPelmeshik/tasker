using Microsoft.AspNetCore.Mvc;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class EventController(IEventService service) : ControllerBase
{
    [HttpPost]
    public async Task<EventCreateResponse> CreateByAreaAsync(EventCreateByAreaRequest item)
    {
        return await service.CreateAsync(item, CancellationToken.None);
    }
    
    [HttpPost]
    public async Task<EventCreateResponse> CreateByGroupAsync(EventCreateByGroupRequest item)
    {
        return await service.CreateAsync(item, CancellationToken.None);
    }
}