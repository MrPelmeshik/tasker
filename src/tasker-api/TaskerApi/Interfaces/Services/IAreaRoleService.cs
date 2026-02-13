using TaskerApi.Models.Common;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Сервис проверки ролей и прав доступа в области
/// </summary>
public interface IAreaRoleService
{
    /// <summary>
    /// Получить роль пользователя в области
    /// </summary>
    /// <param name="areaId">Идентификатор области</param>
    /// <param name="userId">Идентификатор пользователя</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Роль или null, если пользователь не имеет доступа</returns>
    Task<AreaRole?> GetUserRoleAsync(Guid areaId, Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Проверить право на просмотр области (любая роль)
    /// </summary>
    Task<bool> HasViewAccessAsync(Guid areaId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Проверить право на добавление записей по активности
    /// </summary>
    Task<bool> CanAddActivityAsync(Guid areaId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Проверить право на редактирование области (название, описание)
    /// </summary>
    Task<bool> CanEditAreaAsync(Guid areaId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Проверить право на редактирование папки
    /// </summary>
    Task<bool> CanEditFolderAsync(Guid areaId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Проверить право на редактирование задачи
    /// </summary>
    Task<bool> CanEditTaskAsync(Guid areaId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Проверить право на создание/удаление групп, задач и областей
    /// </summary>
    Task<bool> CanCreateOrDeleteStructureAsync(Guid areaId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Проверить право на назначение администратора
    /// </summary>
    Task<bool> CanAppointAdminAsync(Guid areaId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Проверить право на назначение исполнителя или наблюдателя
    /// </summary>
    Task<bool> CanAppointExecutorOrObserverAsync(Guid areaId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Проверить право на передачу роли владельца
    /// </summary>
    Task<bool> CanTransferOwnerAsync(Guid areaId, CancellationToken cancellationToken = default);
}
