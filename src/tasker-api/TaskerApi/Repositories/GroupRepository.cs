using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Models.Entities;

namespace TaskerApi.Repositories;

/// <summary>
/// Репозиторий для работы с группами
/// </summary>
public class GroupRepository : BaseRepository<GroupEntity, Guid>, IGroupRepository
{
    /// <summary>
    /// Инициализирует новый экземпляр репозитория групп
    /// </summary>
    /// <param name="context">Контекст базы данных</param>
    /// <param name="logger">Логгер</param>
    public GroupRepository(TaskerDbContext context, ILogger<GroupRepository> logger) 
        : base(context, logger)
    {
    }

    /// <summary>
    /// Получает группы по идентификатору области
    /// </summary>
    /// <param name="areaId">Идентификатор области</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные группы</param>
    /// <returns>Список групп в указанной области</returns>
    public async Task<IReadOnlyList<GroupEntity>> GetByAreaIdAsync(Guid areaId, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        return await FindAsync(g => g.AreaId == areaId, cancellationToken, includeDeleted);
    }

    /// <summary>
    /// Получает группы по идентификатору создателя
    /// </summary>
    /// <param name="creatorUserId">Идентификатор пользователя-создателя</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные группы</param>
    /// <returns>Список групп создателя</returns>
    public async Task<IReadOnlyList<GroupEntity>> GetByCreatorIdAsync(Guid creatorUserId, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        return await FindAsync(g => g.CreatorUserId == creatorUserId, cancellationToken, includeDeleted);
    }
}
