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

    /// <inheritdoc />
    public async Task<IEnumerable<Guid>> GetSubfolderIdsRecursiveAsync(Guid folderId, CancellationToken cancellationToken = default)
    {
        // 1. Получаем Target Folder чтобы узнать AreaId
        var targetFolder = await DbSet
            .AsNoTracking()
            .Where(f => f.Id == folderId)
            .Select(f => new { f.AreaId })
            .FirstOrDefaultAsync(cancellationToken);

        if (targetFolder == null)
            return Enumerable.Empty<Guid>();

        // 2. Загружаем все папки области (Lightweight projection)
        var allFoldersInArea = await DbSet
            .AsNoTracking()
            .Where(f => f.AreaId == targetFolder.AreaId)
            .Select(f => new { f.Id, f.ParentFolderId })
            .ToListAsync(cancellationToken);

        // 3. Строим дерево в памяти (ParentId -> [ChildId])
        var childrenLookup = allFoldersInArea
            .Where(f => f.ParentFolderId.HasValue)
            .ToLookup(f => f.ParentFolderId!.Value, f => f.Id);

        // 4. BFS/DFS для сбора всех потомков
        var result = new List<Guid>();
        var queue = new Queue<Guid>();
        queue.Enqueue(folderId);

        while (queue.Count > 0)
        {
            var currentId = queue.Dequeue();
            if (childrenLookup.Contains(currentId))
            {
                foreach (var childId in childrenLookup[currentId])
                {
                    result.Add(childId);
                    queue.Enqueue(childId);
                }
            }
        }

        return result;
    }

    /// <inheritdoc />
    public async Task BatchSoftDeleteAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken = default)
    {
        var idSet = ids.ToHashSet();
        if (idSet.Count == 0) return;

        await DbSet
            .Where(f => idSet.Contains(f.Id) && f.IsActive)
            .ExecuteUpdateAsync(s => s
                .SetProperty(f => f.IsActive, false)
                .SetProperty(f => f.DeactivatedAt, DateTime.UtcNow)
                .SetProperty(f => f.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc />
    public async Task BatchUpdateAreaIdAsync(IEnumerable<Guid> folderIds, Guid newAreaId, CancellationToken cancellationToken = default)
    {
        var idSet = folderIds.ToHashSet();
        if (idSet.Count == 0) return;

        await DbSet
            .Where(f => idSet.Contains(f.Id))
            .ExecuteUpdateAsync(s => s
                .SetProperty(f => f.AreaId, newAreaId)
                .SetProperty(f => f.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc />
    public async Task BatchSoftDeleteByAreaIdAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        await DbSet
            .Where(f => f.AreaId == areaId && f.IsActive)
            .ExecuteUpdateAsync(s => s
                .SetProperty(f => f.IsActive, false)
                .SetProperty(f => f.DeactivatedAt, DateTime.UtcNow)
                .SetProperty(f => f.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }
}
