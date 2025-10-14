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
    /// Группа задач.
    /// </summary>
    GROUP,
    
    /// <summary>
    /// Задача.
    /// </summary>
    TASK,
}