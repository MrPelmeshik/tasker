using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Models.Entities;

namespace TaskerApi.Repositories;

/// <summary>
/// Репозиторий для работы с задачами
/// </summary>
public class TaskRepository : BaseRepository<TaskEntity, Guid>, ITaskRepository
{
    /// <summary>
    /// Инициализирует новый экземпляр репозитория задач
    /// </summary>
    /// <param name="context">Контекст базы данных</param>
    /// <param name="logger">Логгер</param>
    public TaskRepository(TaskerDbContext context, ILogger<TaskRepository> logger) 
        : base(context, logger)
    {
    }

    /// <summary>
    /// Получает задачи по идентификатору группы
    /// </summary>
    /// <param name="groupId">Идентификатор группы</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные задачи</param>
    /// <returns>Список задач в указанной группе</returns>
    public async Task<IReadOnlyList<TaskEntity>> GetByGroupIdAsync(Guid groupId, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        return await FindAsync(t => t.GroupId == groupId, cancellationToken, includeDeleted);
    }

    /// <summary>
    /// Получает задачи по идентификатору создателя
    /// </summary>
    /// <param name="creatorUserId">Идентификатор пользователя-создателя</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные задачи</param>
    /// <returns>Список задач создателя</returns>
    public async Task<IReadOnlyList<TaskEntity>> GetByCreatorIdAsync(Guid creatorUserId, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        return await FindAsync(t => t.CreatorUserId == creatorUserId, cancellationToken, includeDeleted);
    }
}
