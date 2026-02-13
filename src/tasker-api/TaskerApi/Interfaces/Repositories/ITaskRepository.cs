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
}
