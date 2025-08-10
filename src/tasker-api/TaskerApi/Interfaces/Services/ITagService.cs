using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

public interface ITagService : ICrudService<TagEntity, Guid>
{
    Task<IEnumerable<TagEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default);
    Task<IEnumerable<TagEntity>> GetByActionAsync(Guid actionId, CancellationToken cancellationToken = default);
    Task<TagEntity?> GetBySlugAsync(Guid areaId, string slug, CancellationToken cancellationToken = default);
    Task<IEnumerable<TagEntity>> GetActiveAsync(CancellationToken cancellationToken = default);
}
