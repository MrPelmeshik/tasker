using System.Collections.Concurrent;
using TaskerApi.Interfaces.Services;

namespace TaskerApi.Services;

/// <summary>
/// Реализация отслеживания групп областей для SignalR-соединений
/// </summary>
public class ConnectionAreaTracker : IConnectionAreaTracker
{
    private readonly ConcurrentDictionary<string, HashSet<Guid>> _connectionAreas = new();

    /// <inheritdoc />
    public IReadOnlySet<Guid> GetAreas(string connectionId)
    {
        return _connectionAreas.TryGetValue(connectionId, out var set)
            ? set
            : (IReadOnlySet<Guid>)new HashSet<Guid>();
    }

    /// <inheritdoc />
    public void SetAreas(string connectionId, IReadOnlyList<Guid> areaIds)
    {
        _connectionAreas[connectionId] = areaIds.ToHashSet();
    }

    /// <inheritdoc />
    public void RemoveConnection(string connectionId)
    {
        _connectionAreas.TryRemove(connectionId, out _);
    }
}
