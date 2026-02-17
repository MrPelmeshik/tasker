using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Repositories;

/// <summary>
/// Репозиторий для работы с папками
/// </summary>
public interface IFolderRepository : IRepository<FolderEntity, Guid>
{
    /// <summary>
    /// Получить корневые папки по области (parent_folder_id = null)
    /// </summary>
    Task<IReadOnlyList<FolderEntity>> GetRootByAreaIdAsync(Guid areaId, CancellationToken cancellationToken = default, bool includeDeleted = false);

    /// <summary>
    /// Получить подпапки по идентификатору родительской папки
    /// </summary>
    Task<IReadOnlyList<FolderEntity>> GetByParentIdAsync(Guid? parentFolderId, CancellationToken cancellationToken = default, bool includeDeleted = false);

    /// <summary>
    /// Получить родительскую папку по id (для проверки циклов)
    /// </summary>
    Task<Guid?> GetParentFolderIdAsync(Guid folderId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить количество корневых папок по списку областей (пакетный запрос)
    /// </summary>
    Task<IReadOnlyDictionary<Guid, int>> GetRootCountByAreaIdsAsync(IEnumerable<Guid> areaIds, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить количество подпапок по списку папок (пакетный запрос)
    /// </summary>
    Task<IReadOnlyDictionary<Guid, int>> GetSubfolderCountByFolderIdsAsync(IEnumerable<Guid> folderIds, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить идентификаторы всех подпапок (рекурсивно)
    /// </summary>
    Task<IEnumerable<Guid>> GetSubfolderIdsRecursiveAsync(Guid folderId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Массовое мягкое удаление папок
    /// </summary>
    Task BatchSoftDeleteAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken = default);

    /// <summary>
    /// Массовое обновление AreaId для списка папок
    /// </summary>
    Task BatchUpdateAreaIdAsync(IEnumerable<Guid> folderIds, Guid newAreaId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Массовое мягкое удаление папок по AreaId
    /// </summary>
    Task BatchSoftDeleteByAreaIdAsync(Guid areaId, CancellationToken cancellationToken = default);
}
