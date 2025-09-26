using TaskerApi.Interfaces.Core;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Interfaces.Services;

public interface IEventEntityService
{
    Task<EventCreateResponse> AddEventCreateEntityAsync(IUnitOfWork uow, Guid entityId, CancellationToken cancellationToken);
    Task<EventCreateResponse> AddEventUpdateEntityAsync(IUnitOfWork uow, Guid entityId, string changes, CancellationToken cancellationToken);
    Task<EventCreateResponse> AddEventDeleteEntityAsync(IUnitOfWork uow, Guid entityId, CancellationToken cancellationToken);
    Task<EventCreateResponse> AddEventAsync(IUnitOfWork uow, EventCreateEntityRequest item, CancellationToken cancellationToken);
    Task<EventCreateResponse> AddEventAsync(EventCreateEntityRequest item, CancellationToken cancellationToken);
}