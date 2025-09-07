using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services.Interfaces;

public interface IAreaService
{
    Task<IEnumerable<AreaResponse>> GetAsync(CancellationToken cancellationToken);
    
    Task<AreaCreateResponse> CreateAsync(AreaCreateRequest item, CancellationToken cancellationToken);
}