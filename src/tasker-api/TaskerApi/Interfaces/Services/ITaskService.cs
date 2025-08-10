using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Интерфейс сервиса для работы с задачами.
/// </summary>
public interface ITaskService : ICrudService<TaskEntity, Guid>
{
}


