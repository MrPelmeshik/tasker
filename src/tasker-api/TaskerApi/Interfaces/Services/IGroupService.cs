using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Interfaces.Services;

public interface IGroupService
{
    Task<IEnumerable<GroupResponse>> GetAsync(CancellationToken cancellationToken);
    
    Task<GroupResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    
    Task<GroupCreateResponse> CreateAsync(GroupCreateRequest item, CancellationToken cancellationToken);
    
    Task UpdateAsync(Guid id, GroupUpdateRequest item, CancellationToken cancellationToken);
    
    Task<IEnumerable<GroupSummaryResponse>> GetGroupShortCardByAreaAsync(Guid areaId, CancellationToken cancellationToken);
}


