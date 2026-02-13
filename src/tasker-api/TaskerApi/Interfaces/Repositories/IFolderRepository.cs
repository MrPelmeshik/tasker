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
}
