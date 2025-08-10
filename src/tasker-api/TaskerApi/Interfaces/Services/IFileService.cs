using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

public interface IFileService : ICrudService<FileEntity, Guid>
{
    Task<IEnumerable<FileEntity>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<FileEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default);
    Task<IEnumerable<FileEntity>> GetByTaskAsync(Guid taskId, CancellationToken cancellationToken = default);
    Task<IEnumerable<FileEntity>> GetByActionAsync(Guid actionId, CancellationToken cancellationToken = default);
    Task<FileEntity?> GetByStorageUrlAsync(string storageUrl, CancellationToken cancellationToken = default);
    Task<IEnumerable<FileEntity>> GetActiveAsync(CancellationToken cancellationToken = default);
}
