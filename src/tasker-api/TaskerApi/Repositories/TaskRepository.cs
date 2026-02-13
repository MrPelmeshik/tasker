using Microsoft.EntityFrameworkCore;
using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Models.Entities;

namespace TaskerApi.Repositories;

/// <summary>
/// Репозиторий для работы с задачами
/// </summary>
public class TaskRepository : BaseRepository<TaskEntity, Guid>, ITaskRepository
{
    /// <summary>
    /// Инициализирует новый экземпляр репозитория задач
    /// </summary>
    /// <param name="context">Контекст базы данных</param>
    /// <param name="logger">Логгер</param>
    public TaskRepository(TaskerDbContext context, ILogger<TaskRepository> logger) 
        : base(context, logger)
    {
    }

    /// <summary>
    /// Получает задачи по идентификатору папки
    /// </summary>
    public async Task<IReadOnlyList<TaskEntity>> GetByFolderIdAsync(Guid folderId, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        return await FindAsync(t => t.FolderId == folderId, cancellationToken, includeDeleted);
    }

    /// <summary>
    /// Получает задачи в корне области (folder_id = null)
    /// </summary>
    public async Task<IReadOnlyList<TaskEntity>> GetByAreaIdRootAsync(Guid areaId, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        return await FindAsync(t => t.AreaId == areaId && t.FolderId == null, cancellationToken, includeDeleted);
    }

    /// <summary>
    /// Получает задачи по идентификатору владельца
    /// </summary>
    /// <param name="ownerUserId">Идентификатор пользователя-владельца</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные задачи</param>
    /// <returns>Список задач владельца</returns>
    public async Task<IReadOnlyList<TaskEntity>> GetByOwnerIdAsync(Guid ownerUserId, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        return await FindAsync(t => t.OwnerUserId == ownerUserId, cancellationToken, includeDeleted);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyDictionary<Guid, int>> GetRootTaskCountByAreaIdsAsync(IEnumerable<Guid> areaIds, CancellationToken cancellationToken = default)
    {
        var ids = areaIds.ToHashSet();
        if (ids.Count == 0)
            return new Dictionary<Guid, int>();

        var counts = await DbSet
            .AsNoTracking()
            .Where(t => ids.Contains(t.AreaId) && t.FolderId == null && t.IsActive)
            .GroupBy(t => t.AreaId)
            .Select(g => new { AreaId = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var result = ids.ToDictionary(id => id, _ => 0);
        foreach (var c in counts)
            result[c.AreaId] = c.Count;
        return result;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyDictionary<Guid, int>> GetTaskCountByFolderIdsAsync(IEnumerable<Guid> folderIds, CancellationToken cancellationToken = default)
    {
        var ids = folderIds.ToHashSet();
        if (ids.Count == 0)
            return new Dictionary<Guid, int>();

        var counts = await DbSet
            .AsNoTracking()
            .Where(t => t.FolderId.HasValue && ids.Contains(t.FolderId.Value) && t.IsActive)
            .GroupBy(t => t.FolderId!.Value)
            .Select(g => new { FolderId = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var result = ids.ToDictionary(id => id, _ => 0);
        foreach (var c in counts)
            result[c.FolderId] = c.Count;
        return result;
    }
}
