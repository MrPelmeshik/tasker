using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Repositories;

/// <summary>
/// Репозиторий для работы с областями
/// </summary>
public interface IAreaRepository : IRepository<AreaEntity, Guid>
{
    /// <summary>
    /// Получить области по владельцу
    /// </summary>
    /// <param name="ownerUserId">Идентификатор владельца</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Список областей</returns>
    Task<IReadOnlyList<AreaEntity>> GetByOwnerIdAsync(Guid ownerUserId, CancellationToken cancellationToken = default, bool includeDeleted = false);

    /// <summary>
    /// Получить область по названию
    /// </summary>
    /// <param name="name">Название области</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Область или null</returns>
    Task<AreaEntity?> GetByNameAsync(string name, CancellationToken cancellationToken = default, bool includeDeleted = false);
}
