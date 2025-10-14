using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Models.Entities;

namespace TaskerApi.Repositories;

/// <summary>
/// Репозиторий для работы с логами пользователей
/// </summary>
public class UserLogRepository : BaseRepository<UserLogEntity, int>, IUserLogRepository
{
    /// <summary>
    /// Инициализирует новый экземпляр репозитория логов пользователей
    /// </summary>
    /// <param name="context">Контекст базы данных</param>
    /// <param name="logger">Логгер</param>
    public UserLogRepository(TaskerDbContext context, ILogger<UserLogRepository> logger) 
        : base(context, logger)
    {
    }

    /// <summary>
    /// Получает логи пользователя по его идентификатору
    /// </summary>
    /// <param name="userId">Идентификатор пользователя</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные записи</param>
    /// <returns>Список логов пользователя</returns>
    public async Task<IReadOnlyList<UserLogEntity>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        return await FindAsync(ul => ul.UserId == userId, cancellationToken, includeDeleted);
    }

    /// <summary>
    /// Получает логи по эндпоинту
    /// </summary>
    /// <param name="endpoint">Название эндпоинта</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные записи</param>
    /// <returns>Список логов для указанного эндпоинта</returns>
    public async Task<IReadOnlyList<UserLogEntity>> GetByEndpointAsync(string endpoint, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        return await FindAsync(ul => ul.Endpoint == endpoint, cancellationToken, includeDeleted);
    }
}
