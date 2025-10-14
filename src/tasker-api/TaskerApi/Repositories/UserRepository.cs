using Microsoft.EntityFrameworkCore;
using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Models.Entities;

namespace TaskerApi.Repositories;

/// <summary>
/// Репозиторий для работы с пользователями
/// </summary>
public class UserRepository : BaseRepository<UserEntity, Guid>, IUserRepository
{
    /// <summary>
    /// Инициализирует новый экземпляр репозитория пользователей
    /// </summary>
    /// <param name="context">Контекст базы данных</param>
    /// <param name="logger">Логгер</param>
    public UserRepository(TaskerDbContext context, ILogger<UserRepository> logger) 
        : base(context, logger)
    {
    }

    /// <summary>
    /// Получает пользователя по имени
    /// </summary>
    /// <param name="name">Имя пользователя</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленных пользователей</param>
    /// <returns>Найденный пользователь или null</returns>
    public async Task<UserEntity?> GetByNameAsync(string name, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        return await FirstOrDefaultAsync(u => u.Name == name, cancellationToken, includeDeleted);
    }

    /// <summary>
    /// Получает пользователя по email
    /// </summary>
    /// <param name="email">Email пользователя</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленных пользователей</param>
    /// <returns>Найденный пользователь или null</returns>
    public async Task<UserEntity?> GetByEmailAsync(string email, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        return await FirstOrDefaultAsync(u => u.Email == email, cancellationToken, includeDeleted);
    }
}
