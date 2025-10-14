using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Repositories;

/// <summary>
/// Репозиторий для работы с целями
/// </summary>
public interface IPurposeRepository : IRepository<PurposeEntity, Guid>
{
    /// <summary>
    /// Получить цели по создателю
    /// </summary>
    /// <param name="creatorUserId">Идентификатор создателя</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Список целей</returns>
    Task<IReadOnlyList<PurposeEntity>> GetByCreatorIdAsync(Guid creatorUserId, CancellationToken cancellationToken = default, bool includeDeleted = false);
}
