namespace TaskerApi.Models.Common;

/// <summary>
/// Статусы задач
/// </summary>
public enum TaskStatus
{
    /// <summary>
    /// Новая
    /// </summary>
    New = 1,
    
    /// <summary>
    /// В ожидании
    /// </summary>
    Pending = 2,
    
    /// <summary>
    /// В работе
    /// </summary>
    InProgress = 3,
    
    /// <summary>
    /// Закрыта
    /// </summary>
    Closed = 4,
    
    /// <summary>
    /// Отменена
    /// </summary>
    Cancelled = 5,
}
