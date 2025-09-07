using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Interfaces.Services;

public interface IEventService
{
    Task<EventCreateResponse> CreateAsync(EventCreateByAreaRequest item, CancellationToken cancellationToken);
    Task<EventCreateResponse> CreateAsync(EventCreateByGroupRequest item, CancellationToken cancellationToken);
}