using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Repositories;

/// <summary>
/// Репозиторий для работы с группами
/// </summary>
public interface IGroupRepository : IRepository<GroupEntity, Guid>
{
    /// <summary>
    /// Получить группы по области
    /// </summary>
    /// <param name="areaId">Идентификатор области</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Список групп</returns>
    Task<IReadOnlyList<GroupEntity>> GetByAreaIdAsync(Guid areaId, CancellationToken cancellationToken = default, bool includeDeleted = false);

    /// <summary>
    /// Получить группы по создателю
    /// </summary>
    /// <param name="creatorUserId">Идентификатор создателя</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Список групп</returns>
    Task<IReadOnlyList<GroupEntity>> GetByCreatorIdAsync(Guid creatorUserId, CancellationToken cancellationToken = default, bool includeDeleted = false);
}
