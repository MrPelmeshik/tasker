using System.Data;
using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Providers;

/// <summary>
/// Интерфейс провайдера для работы с областями.
/// </summary>
public interface IAreaProvider : ICrudProvider<AreaEntity, Guid>
{
}


