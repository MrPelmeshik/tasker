using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Services.Base;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для работы с пользователями с использованием Entity Framework
/// </summary>
public class UserService(
    ILogger<UserService> logger,
    IUserRepository userRepository,
    TaskerDbContext context)
    : BaseService(logger, null), IUserService
{
    /// <summary>
    /// Получить пользователя по идентификатору
    /// </summary>
    /// <param name="id">Идентификатор пользователя</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Пользователь или null, если не найден</returns>
    public async Task<UserEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            return await userRepository.GetByIdAsync(id, cancellationToken);
        }, nameof(GetByIdAsync), new { id });
    }

    /// <summary>
    /// Получить пользователя по имени
    /// </summary>
    /// <param name="name">Имя пользователя</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Пользователь или null, если не найден</returns>
    public async Task<UserEntity?> GetByNameAsync(string name, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            return await userRepository.GetByNameAsync(name, cancellationToken);
        }, nameof(GetByNameAsync), new { name });
    }

    /// <summary>
    /// Получить пользователя по email
    /// </summary>
    /// <param name="email">Email пользователя</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Пользователь или null, если не найден</returns>
    public async Task<UserEntity?> GetByEmailAsync(string email, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            return await userRepository.GetByEmailAsync(email, cancellationToken);
        }, nameof(GetByEmailAsync), new { email });
    }

    /// <summary>
    /// Создать нового пользователя
    /// </summary>
    /// <param name="user">Данные пользователя</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Созданный пользователь</returns>
    public async Task<UserEntity> CreateAsync(UserEntity user, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var existingByName = await userRepository.GetByNameAsync(user.Name, cancellationToken);
            if (existingByName != null)
            {
                throw new InvalidOperationException("Пользователь с таким именем уже существует");
            }

            if (!string.IsNullOrEmpty(user.Email))
            {
                var existingByEmail = await userRepository.GetByEmailAsync(user.Email, cancellationToken);
                if (existingByEmail != null)
                {
                    throw new InvalidOperationException("Пользователь с таким email уже существует");
                }
            }

            return await userRepository.CreateAsync(user, cancellationToken);
        }, nameof(CreateAsync), user);
    }

    /// <summary>
    /// Обновить пользователя
    /// </summary>
    /// <param name="user">Данные пользователя для обновления</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Обновленный пользователь</returns>
    public async Task<UserEntity> UpdateAsync(UserEntity user, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            return await userRepository.UpdateAsync(user, cancellationToken);
        }, nameof(UpdateAsync), new { user.Id });
    }

    /// <summary>
    /// Удалить пользователя
    /// </summary>
    /// <param name="id">Идентификатор пользователя</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        await ExecuteWithErrorHandling(async () =>
        {
            await userRepository.DeleteAsync(id, cancellationToken);
        }, nameof(DeleteAsync), new { id });
    }

    /// <summary>
    /// Получить всех пользователей
    /// </summary>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Список всех пользователей</returns>
    public async Task<IEnumerable<UserEntity>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            return await userRepository.GetAllAsync(cancellationToken);
        }, nameof(GetAllAsync));
    }
}