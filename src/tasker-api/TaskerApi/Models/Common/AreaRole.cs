namespace TaskerApi.Models.Common;

/// <summary>
/// Роли пользователей в области
/// </summary>
public enum AreaRole
{
    /// <summary>
    /// Владелец области (строго один на область)
    /// </summary>
    Owner = 0,

    /// <summary>
    /// Администратор области
    /// </summary>
    Administrator = 1,

    /// <summary>
    /// Исполнитель
    /// </summary>
    Executor = 2,

    /// <summary>
    /// Наблюдатель
    /// </summary>
    Observer = 3,
}
