namespace TaskerApi.Models.Common;

/// <summary>
/// Типы событий в системе.
/// </summary>
public enum EventType
{
    /// <summary>
    /// Неизвестный тип события.
    /// </summary>
    UNKNOWN = 0,
    
    /// <summary>
    /// Создание сущности.
    /// </summary>
    CREATE,
    
    /// <summary>
    /// Обновление сущности.
    /// </summary>
    UPDATE,
    
    /// <summary>
    /// Удаление сущности.
    /// </summary>
    DELETE,
    
    /// <summary>
    /// Заметка.
    /// </summary>
    NOTE,
    
    /// <summary>
    /// Активность.
    /// </summary>
    ACTIVITY
}