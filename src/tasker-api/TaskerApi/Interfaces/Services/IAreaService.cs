using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Interfaces.Services;

public interface IAreaService
{
    Task<IEnumerable<AreaResponse>> GetAllAsync(CancellationToken cancellationToken);
    
    Task<AreaResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    
    Task<AreaCreateResponse> CreateAsync(AreaCreateRequest item, CancellationToken cancellationToken);
    
    Task UpdateAsync(Guid id, AreaUpdateRequest item, CancellationToken cancellationToken);
    
    Task<IEnumerable<AreaShortCardResponse>> GetAreaShortCardAsync(CancellationToken cancellationToken);
}