namespace TaskerApi.Models.Common;

/// <summary>
/// Типы сущностей в системе.
/// </summary>
public enum EntityType
{
    /// <summary>
    /// Область задач.
    /// </summary>
    AREA = 0,
    
    /// <summary>
    /// Папка задач.
    /// </summary>
    FOLDER,
    
    /// <summary>
    /// Задача.
    /// </summary>
    TASK,

    /// <summary>
    /// Событие/активность.
    /// </summary>
    EVENT,
}