using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Models.Entities;

namespace TaskerApi.Repositories;

/// <summary>
/// Репозиторий для работы с областями
/// </summary>
public class AreaRepository : BaseRepository<AreaEntity, Guid>, IAreaRepository
{
    /// <summary>
    /// Инициализирует новый экземпляр репозитория областей
    /// </summary>
    /// <param name="context">Контекст базы данных</param>
    /// <param name="logger">Логгер</param>
    public AreaRepository(TaskerDbContext context, ILogger<AreaRepository> logger) 
        : base(context, logger)
    {
    }

    /// <summary>
    /// Получает области по идентификатору владельца
    /// </summary>
    /// <param name="ownerUserId">Идентификатор пользователя-владельца</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные области</param>
    /// <returns>Список областей владельца</returns>
    public async Task<IReadOnlyList<AreaEntity>> GetByOwnerIdAsync(Guid ownerUserId, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        return await FindAsync(a => a.OwnerUserId == ownerUserId, cancellationToken, includeDeleted);
    }

    /// <summary>
    /// Получает область по названию
    /// </summary>
    /// <param name="name">Название области</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные области</param>
    /// <returns>Найденная область или null</returns>
    public async Task<AreaEntity?> GetByNameAsync(string name, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        var areas = await FindAsync(a => a.Title == name, cancellationToken, includeDeleted);
        return areas.FirstOrDefault();
    }
}
