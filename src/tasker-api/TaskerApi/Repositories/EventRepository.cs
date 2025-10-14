using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Models.Entities;

namespace TaskerApi.Repositories;

/// <summary>
/// Репозиторий для работы с событиями
/// </summary>
public class EventRepository : BaseRepository<EventEntity, Guid>, IEventRepository
{
    /// <summary>
    /// Инициализирует новый экземпляр репозитория событий
    /// </summary>
    /// <param name="context">Контекст базы данных</param>
    /// <param name="logger">Логгер</param>
    public EventRepository(TaskerDbContext context, ILogger<EventRepository> logger) 
        : base(context, logger)
    {
    }
}
