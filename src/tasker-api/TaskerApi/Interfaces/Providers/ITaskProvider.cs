using System.Data;
using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Providers;

/// <summary>
/// Интерфейс провайдера для работы с задачами.
/// </summary>
public interface ITaskProvider : ICrudProvider<TaskEntity, Guid>
{
}


