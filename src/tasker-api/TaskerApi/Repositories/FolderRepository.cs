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

    /// <inheritdoc />
    public async Task<IReadOnlyDictionary<Guid, int>> GetRootCountByAreaIdsAsync(IEnumerable<Guid> areaIds, CancellationToken cancellationToken = default)
    {
        var ids = areaIds.ToHashSet();
        if (ids.Count == 0)
            return new Dictionary<Guid, int>();

        var counts = await DbSet
            .AsNoTracking()
            .Where(f => ids.Contains(f.AreaId) && f.ParentFolderId == null && f.IsActive)
            .GroupBy(f => f.AreaId)
            .Select(g => new { AreaId = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var result = ids.ToDictionary(id => id, _ => 0);
        foreach (var c in counts)
            result[c.AreaId] = c.Count;
        return result;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyDictionary<Guid, int>> GetSubfolderCountByFolderIdsAsync(IEnumerable<Guid> folderIds, CancellationToken cancellationToken = default)
    {
        var ids = folderIds.ToHashSet();
        if (ids.Count == 0)
            return new Dictionary<Guid, int>();

        var counts = await DbSet
            .AsNoTracking()
            .Where(f => f.ParentFolderId.HasValue && ids.Contains(f.ParentFolderId.Value) && f.IsActive)
            .GroupBy(f => f.ParentFolderId!.Value)
            .Select(g => new { FolderId = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var result = ids.ToDictionary(id => id, _ => 0);
        foreach (var c in counts)
            result[c.FolderId] = c.Count;
        return result;
    }
}
