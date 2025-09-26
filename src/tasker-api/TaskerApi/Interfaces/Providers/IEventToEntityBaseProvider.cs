namespace TaskerApi.Interfaces.Providers;

public interface IEventToEntityBaseProvider<T> : IBaseProvider<T, Guid> where T : class;