using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Интерфейс сервиса для работы с пользователями.
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Получить всех пользователей.
    /// </summary>
    Task<IEnumerable<UserEntity>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить пользователя по идентификатору.
    /// </summary>
    Task<UserEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить детальную информацию о пользователе.
    /// </summary>
    Task<UserEntity?> GetDetailedAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Создать пользователя.
    /// </summary>
    Task<Guid> CreateAsync(UserEntity user, CancellationToken cancellationToken = default);

    /// <summary>
    /// Обновить пользователя.
    /// </summary>
    Task UpdateAsync(UserEntity user, CancellationToken cancellationToken = default);

    /// <summary>
    /// Деактивировать пользователя.
    /// </summary>
    Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить пользователей по области.
    /// </summary>
    Task<IEnumerable<UserEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить активных пользователей.
    /// </summary>
    Task<IEnumerable<UserEntity>> GetActiveAsync(CancellationToken cancellationToken = default);
}
