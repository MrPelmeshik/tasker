using TaskerApi.Models.Common;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Сервис автоматического логирования событий при изменении сущностей (Area, Folder, Task).
/// </summary>
public interface IEntityEventLogger
{
    /// <summary>
    /// Записывает событие для сущности в таблицу events и связывает с сущностью через соответствующую таблицу связей.
    /// Ошибки логирования не пробрасываются наружу (fail-safe).
    /// </summary>
    /// <param name="entityType">Тип сущности (AREA, GROUP, TASK).</param>
    /// <param name="entityId">Идентификатор сущности.</param>
    /// <param name="eventType">Тип события (CREATE, UPDATE, DELETE).</param>
    /// <param name="title">Заголовок события (например, название сущности).</param>
    /// <param name="messageJson">Сообщение в формате JSON (опционально, для UPDATE — дифф old/new).</param>
    /// <param name="cancellationToken">Токен отмены операции.</param>
    Task LogAsync(
        EntityType entityType,
        Guid entityId,
        EventType eventType,
        string title,
        string? messageJson,
        CancellationToken cancellationToken = default);
}
