using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Models.Entities;

namespace TaskerApi.Repositories;

/// <summary>
/// Репозиторий для работы с подзадачами
/// </summary>
public class SubtaskRepository : BaseRepository<SubtaskEntity, Guid>, ISubtaskRepository
{
    /// <summary>
    /// Инициализирует новый экземпляр репозитория подзадач
    /// </summary>
    /// <param name="context">Контекст базы данных</param>
    /// <param name="logger">Логгер</param>
    public SubtaskRepository(TaskerDbContext context, ILogger<SubtaskRepository> logger) 
        : base(context, logger)
    {
    }

    /// <summary>
    /// Получает подзадачи по идентификатору задачи
    /// </summary>
    /// <param name="taskId">Идентификатор задачи</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные подзадачи</param>
    /// <returns>Список подзадач для указанной задачи</returns>
    public async Task<IReadOnlyList<SubtaskEntity>> GetByTaskIdAsync(Guid taskId, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        return await FindAsync(s => s.TaskId == taskId, cancellationToken, includeDeleted);
    }
}
