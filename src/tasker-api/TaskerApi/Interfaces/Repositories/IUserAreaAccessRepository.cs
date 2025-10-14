using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Repositories;

/// <summary>
/// Репозиторий для работы с доступом пользователей к областям
/// </summary>
public interface IUserAreaAccessRepository : IRepository<UserAreaAccessEntity, Guid>
{
    /// <summary>
    /// Получить доступы по пользователю
    /// </summary>
    /// <param name="userId">Идентификатор пользователя</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Список доступов</returns>
    Task<IReadOnlyList<UserAreaAccessEntity>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default, bool includeDeleted = false);

    /// <summary>
    /// Получить доступы по области
    /// </summary>
    /// <param name="areaId">Идентификатор области</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Список доступов</returns>
    Task<IReadOnlyList<UserAreaAccessEntity>> GetByAreaIdAsync(Guid areaId, CancellationToken cancellationToken = default, bool includeDeleted = false);
}
