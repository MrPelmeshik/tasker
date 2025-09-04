using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Providers;

public interface IEventProvider : IBaseProvider<EventEntity, Guid>;