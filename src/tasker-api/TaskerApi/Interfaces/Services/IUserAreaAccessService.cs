using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Сервис для управления правами доступа пользователей к областям
/// </summary>
public interface IUserAreaAccessService
{
    /// <summary>
    /// Проверить, есть ли у пользователя доступ к области
    /// </summary>
    /// <param name="userId">ID пользователя</param>
    /// <param name="areaId">ID области</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>True, если доступ есть</returns>
    Task<bool> HasAccessAsync(Guid userId, Guid areaId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить список областей, к которым у пользователя есть доступ
    /// </summary>
    /// <param name="userId">ID пользователя</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Список ID областей</returns>
    Task<IReadOnlyList<Guid>> GetUserAccessibleAreaIdsAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Предоставить доступ пользователю к области
    /// </summary>
    /// <param name="userId">ID пользователя</param>
    /// <param name="areaId">ID области</param>
    /// <param name="grantedByUserId">ID пользователя, предоставляющего доступ</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>ID созданной записи</returns>
    Task<Guid> GrantAccessAsync(Guid userId, Guid areaId, Guid grantedByUserId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Отозвать доступ пользователя к области
    /// </summary>
    /// <param name="userId">ID пользователя</param>
    /// <param name="areaId">ID области</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Количество затронутых записей</returns>
    Task<int> RevokeAccessAsync(Guid userId, Guid areaId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Проверить, может ли пользователь работать с группой (через доступ к области)
    /// </summary>
    /// <param name="userId">ID пользователя</param>
    /// <param name="groupId">ID группы</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>True, если доступ есть</returns>
    Task<bool> CanAccessGroupAsync(Guid userId, Guid groupId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Проверить, может ли пользователь работать с задачей (через доступ к области группы)
    /// </summary>
    /// <param name="userId">ID пользователя</param>
    /// <param name="taskId">ID задачи</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>True, если доступ есть</returns>
    Task<bool> CanAccessTaskAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Проверить, может ли пользователь работать с подзадачей (через доступ к области группы задачи)
    /// </summary>
    /// <param name="userId">ID пользователя</param>
    /// <param name="subtaskId">ID подзадачи</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>True, если доступ есть</returns>
    Task<bool> CanAccessSubtaskAsync(Guid userId, Guid subtaskId, CancellationToken cancellationToken = default);
}
