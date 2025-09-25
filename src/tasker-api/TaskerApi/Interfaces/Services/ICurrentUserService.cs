using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

public interface ICurrentUserService
{
    Guid UserId { get; }
    
    bool IsAuthenticated { get; }
    
    IReadOnlyList<Guid> AccessibleAreas { get; }
    
    IReadOnlyList<Guid> AccessibleGroups { get; }
    
    bool HasAccessToArea(Guid areaId);
    
    bool HasAccessToArea(IList<Guid> areaId);
    
    bool HasAccessToGroup(Guid groupId);
    
    bool HasAccessToGroup(IList<Guid> groupIds);
}


