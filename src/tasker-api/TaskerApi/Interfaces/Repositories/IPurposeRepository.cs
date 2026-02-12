using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Repositories;

/// <summary>
/// Репозиторий для работы с целями
/// </summary>
public interface IPurposeRepository : IRepository<PurposeEntity, Guid>
{
    /// <summary>
    /// Получить цели по владельцу
    /// </summary>
    /// <param name="ownerUserId">Идентификатор владельца</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Список целей</returns>
    Task<IReadOnlyList<PurposeEntity>> GetByOwnerIdAsync(Guid ownerUserId, CancellationToken cancellationToken = default, bool includeDeleted = false);
}
