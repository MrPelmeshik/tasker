using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Repositories;

/// <summary>
/// Репозиторий для работы с задачами
/// </summary>
public interface ITaskRepository : IRepository<TaskEntity, Guid>
{
    /// <summary>
    /// Получить задачи по папке
    /// </summary>
    Task<IReadOnlyList<TaskEntity>> GetByFolderIdAsync(Guid folderId, CancellationToken cancellationToken = default, bool includeDeleted = false);

    /// <summary>
    /// Получить задачи в корне области (folder_id = null)
    /// </summary>
    Task<IReadOnlyList<TaskEntity>> GetByAreaIdRootAsync(Guid areaId, CancellationToken cancellationToken = default, bool includeDeleted = false);

    /// <summary>
    /// Получить задачи по владельцу
    /// </summary>
    /// <param name="ownerUserId">Идентификатор владельца</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Список задач</returns>
    Task<IReadOnlyList<TaskEntity>> GetByOwnerIdAsync(Guid ownerUserId, CancellationToken cancellationToken = default, bool includeDeleted = false);

    /// <summary>
    /// Получить количество задач в корне по списку областей (пакетный запрос)
    /// </summary>
    Task<IReadOnlyDictionary<Guid, int>> GetRootTaskCountByAreaIdsAsync(IEnumerable<Guid> areaIds, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить количество задач по списку папок (пакетный запрос)
    /// </summary>
    Task<IReadOnlyDictionary<Guid, int>> GetTaskCountByFolderIdsAsync(IEnumerable<Guid> folderIds, CancellationToken cancellationToken = default);

    /// <summary>
    /// Массовое мягкое удаление задач по списку папок
    /// </summary>
    Task BatchSoftDeleteByFolderIdsAsync(IEnumerable<Guid> folderIds, CancellationToken cancellationToken = default);

    /// <summary>
    /// Массовое мягкое удаление задач по AreaId
    /// </summary>
    Task BatchSoftDeleteByAreaIdAsync(Guid areaId, CancellationToken cancellationToken = default);
}
