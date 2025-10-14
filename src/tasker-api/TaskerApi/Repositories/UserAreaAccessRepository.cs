using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Models.Entities;

namespace TaskerApi.Repositories;

/// <summary>
/// Репозиторий для работы с доступом пользователей к областям
/// </summary>
public class UserAreaAccessRepository : BaseRepository<UserAreaAccessEntity, Guid>, IUserAreaAccessRepository
{
    /// <summary>
    /// Инициализирует новый экземпляр репозитория доступа пользователей к областям
    /// </summary>
    /// <param name="context">Контекст базы данных</param>
    /// <param name="logger">Логгер</param>
    public UserAreaAccessRepository(TaskerDbContext context, ILogger<UserAreaAccessRepository> logger) 
        : base(context, logger)
    {
    }

    /// <summary>
    /// Получает доступы пользователя к областям по идентификатору пользователя
    /// </summary>
    /// <param name="userId">Идентификатор пользователя</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные записи</param>
    /// <returns>Список доступов пользователя к областям</returns>
    public async Task<IReadOnlyList<UserAreaAccessEntity>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        return await FindAsync(uaa => uaa.UserId == userId, cancellationToken, includeDeleted);
    }

    /// <summary>
    /// Получает доступы к области по идентификатору области
    /// </summary>
    /// <param name="areaId">Идентификатор области</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные записи</param>
    /// <returns>Список доступов к указанной области</returns>
    public async Task<IReadOnlyList<UserAreaAccessEntity>> GetByAreaIdAsync(Guid areaId, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        return await FindAsync(uaa => uaa.AreaId == areaId, cancellationToken, includeDeleted);
    }
}
