using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services.Interfaces;

public interface IEventService
{
    Task<EventCreateResponse> CreateAsync(EventCreateByAreaRequest item, CancellationToken cancellationToken);
    Task<EventCreateResponse> CreateAsync(EventCreateByGroupRequest item, CancellationToken cancellationToken);
}