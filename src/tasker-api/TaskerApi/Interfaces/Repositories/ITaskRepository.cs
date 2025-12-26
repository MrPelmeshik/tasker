using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Repositories;

/// <summary>
/// Репозиторий для работы с задачами
/// </summary>
public interface ITaskRepository : IRepository<TaskEntity, Guid>
{
    /// <summary>
    /// Получить задачи по группе
    /// </summary>
    /// <param name="groupId">Идентификатор группы</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Список задач</returns>
    Task<IReadOnlyList<TaskEntity>> GetByGroupIdAsync(Guid groupId, CancellationToken cancellationToken = default, bool includeDeleted = false);

    /// <summary>
    /// Получить задачи по создателю
    /// </summary>
    /// <param name="creatorUserId">Идентификатор создателя</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Список задач</returns>
    Task<IReadOnlyList<TaskEntity>> GetByCreatorIdAsync(Guid creatorUserId, CancellationToken cancellationToken = default, bool includeDeleted = false);
}
