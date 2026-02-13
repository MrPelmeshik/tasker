using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Сервис для работы с папками
/// </summary>
public interface IFolderService
{
    /// <summary>
    /// Получить все папки
    /// </summary>
    Task<IEnumerable<FolderResponse>> GetAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Получить папку по идентификатору
    /// </summary>
    Task<FolderResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Создать новую папку
    /// </summary>
    Task<FolderResponse> CreateAsync(FolderCreateRequest item, CancellationToken cancellationToken);

    /// <summary>
    /// Обновить существующую папку
    /// </summary>
    Task<FolderResponse> UpdateAsync(Guid id, FolderUpdateRequest item, CancellationToken cancellationToken);

    /// <summary>
    /// Удалить папку
    /// </summary>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Получить корневые папки по области
    /// </summary>
    Task<IEnumerable<FolderSummaryResponse>> GetRootByAreaAsync(Guid areaId, CancellationToken cancellationToken);

    /// <summary>
    /// Получить подпапки по родительской папке
    /// </summary>
    Task<IEnumerable<FolderSummaryResponse>> GetByParentAsync(Guid? parentFolderId, Guid areaId, CancellationToken cancellationToken);
}
