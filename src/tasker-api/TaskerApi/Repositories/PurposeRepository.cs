using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Models.Entities;

namespace TaskerApi.Repositories;

/// <summary>
/// Репозиторий для работы с целями
/// </summary>
public class PurposeRepository : BaseRepository<PurposeEntity, Guid>, IPurposeRepository
{
    /// <summary>
    /// Инициализирует новый экземпляр репозитория целей
    /// </summary>
    /// <param name="context">Контекст базы данных</param>
    /// <param name="logger">Логгер</param>
    public PurposeRepository(TaskerDbContext context, ILogger<PurposeRepository> logger) 
        : base(context, logger)
    {
    }

    /// <summary>
    /// Получает цели по идентификатору создателя
    /// </summary>
    /// <param name="creatorUserId">Идентификатор пользователя-создателя</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные цели</param>
    /// <returns>Список целей создателя</returns>
    public async Task<IReadOnlyList<PurposeEntity>> GetByCreatorIdAsync(Guid creatorUserId, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        return await FindAsync(p => p.CreatorUserId == creatorUserId, cancellationToken, includeDeleted);
    }
}
