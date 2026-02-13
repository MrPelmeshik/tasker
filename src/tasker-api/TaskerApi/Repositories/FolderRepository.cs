using Microsoft.EntityFrameworkCore;
using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Models.Entities;

namespace TaskerApi.Repositories;

/// <summary>
/// Репозиторий для работы с папками
/// </summary>
public class FolderRepository : BaseRepository<FolderEntity, Guid>, IFolderRepository
{
    /// <summary>
    /// Инициализирует новый экземпляр репозитория папок
    /// </summary>
    public FolderRepository(TaskerDbContext context, ILogger<FolderRepository> logger)
        : base(context, logger)
    {
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<FolderEntity>> GetRootByAreaIdAsync(Guid areaId, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        return await FindAsync(f => f.AreaId == areaId && f.ParentFolderId == null, cancellationToken, includeDeleted);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<FolderEntity>> GetByParentIdAsync(Guid? parentFolderId, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        return await FindAsync(f => f.ParentFolderId == parentFolderId, cancellationToken, includeDeleted);
    }

    /// <inheritdoc />
    public async Task<Guid?> GetParentFolderIdAsync(Guid folderId, CancellationToken cancellationToken = default)
    {
        var folder = await DbSet
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(f => f.Id == folderId)
            .Select(f => new { f.ParentFolderId })
            .FirstOrDefaultAsync(cancellationToken);
        return folder?.ParentFolderId;
    }
}
