using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

public interface ICurrentUserService
{
    Guid UserId { get; }
    
    bool IsAuthenticated { get; }
    
    IReadOnlyList<Guid> AccessibleAreas { get; }
    
    bool HasAccessToArea(Guid areaId);
    
    bool HasAccessToArea(IList<Guid> areaId);
}


