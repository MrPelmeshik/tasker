using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Repositories;

/// <summary>
/// Репозиторий для работы с логами пользователей
/// </summary>
public interface IUserLogRepository : IRepository<UserLogEntity, int>
{
    /// <summary>
    /// Получить логи по пользователю
    /// </summary>
    /// <param name="userId">Идентификатор пользователя</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Список логов</returns>
    Task<IReadOnlyList<UserLogEntity>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default, bool includeDeleted = false);

    /// <summary>
    /// Получить логи по эндпоинту
    /// </summary>
    /// <param name="endpoint">Эндпоинт</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Список логов</returns>
    Task<IReadOnlyList<UserLogEntity>> GetByEndpointAsync(string endpoint, CancellationToken cancellationToken = default, bool includeDeleted = false);
}
