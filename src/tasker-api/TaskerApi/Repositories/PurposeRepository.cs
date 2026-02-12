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
    /// Получает цели по идентификатору владельца
    /// </summary>
    /// <param name="ownerUserId">Идентификатор пользователя-владельца</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные цели</param>
    /// <returns>Список целей владельца</returns>
    public async Task<IReadOnlyList<PurposeEntity>> GetByOwnerIdAsync(Guid ownerUserId, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        return await FindAsync(p => p.OwnerUserId == ownerUserId, cancellationToken, includeDeleted);
    }
}
