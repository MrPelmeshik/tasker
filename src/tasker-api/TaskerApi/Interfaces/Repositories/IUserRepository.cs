using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Repositories;

/// <summary>
/// Репозиторий для работы с пользователями
/// </summary>
public interface IUserRepository : IRepository<UserEntity, Guid>
{
    /// <summary>
    /// Получить пользователя по имени
    /// </summary>
    /// <param name="name">Имя пользователя</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Пользователь или null</returns>
    Task<UserEntity?> GetByNameAsync(string name, CancellationToken cancellationToken = default, bool includeDeleted = false);

    /// <summary>
    /// Получить пользователя по email
    /// </summary>
    /// <param name="email">Email пользователя</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="includeDeleted">Включить удаленные записи</param>
    /// <returns>Пользователь или null</returns>
    Task<UserEntity?> GetByEmailAsync(string email, CancellationToken cancellationToken = default, bool includeDeleted = false);
}
