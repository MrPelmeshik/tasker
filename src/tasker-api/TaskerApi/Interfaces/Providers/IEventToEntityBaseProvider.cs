using TaskerApi.Interfaces.Models.Entities;

namespace TaskerApi.Interfaces.Providers;

public interface IEventToEntityBaseProvider<T> : IBaseProvider<T, Guid> where T : class, IDbEntity;