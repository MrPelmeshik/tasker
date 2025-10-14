using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Repositories;

/// <summary>
/// Репозиторий для работы с событиями
/// </summary>
public interface IEventRepository : IRepository<EventEntity, Guid>
{
}
