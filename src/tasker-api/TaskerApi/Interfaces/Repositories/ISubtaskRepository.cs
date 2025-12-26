using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Repositories;

/// <summary>
/// Репозиторий для работы с подзадачами
/// </summary>
public interface ISubtaskRepository : IRepository<SubtaskEntity, Guid>
{
    /// <summary>
    /// Получить подзадачи по задаче
    /// </summary>
    /// <param name="taskId">Идентификатор задачи</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Список подзадач</returns>
    Task<IReadOnlyList<SubtaskEntity>> GetByTaskIdAsync(Guid taskId, CancellationToken cancellationToken = default, bool includeDeleted = false);
}
