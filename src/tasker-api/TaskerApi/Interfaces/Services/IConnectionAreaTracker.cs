namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Отслеживание групп областей для SignalR-соединений (JoinAreas/LeaveGroups)
/// </summary>
public interface IConnectionAreaTracker
{
    /// <summary>
    /// Получить текущий набор areaIds для соединения
    /// </summary>
    IReadOnlySet<Guid> GetAreas(string connectionId);

    /// <summary>
    /// Обновить набор areaIds для соединения
    /// </summary>
    void SetAreas(string connectionId, IReadOnlyList<Guid> areaIds);

    /// <summary>
    /// Удалить соединение (при отключении)
    /// </summary>
    void RemoveConnection(string connectionId);
}
