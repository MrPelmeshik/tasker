using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Сервис для работы с пользователями.
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Получить всех пользователей.
    /// </summary>
    Task<IEnumerable<UserResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить пользователя по идентификатору.
    /// </summary>
    Task<UserResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить пользователя по имени.
    /// </summary>
    Task<UserResponse?> GetByNameAsync(string name, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить пользователя по email.
    /// </summary>
    Task<UserResponse?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Создать нового пользователя.
    /// </summary>
    Task<UserResponse> CreateAsync(UserCreateRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Обновить пользователя.
    /// </summary>
    Task<UserResponse> UpdateAsync(Guid id, UserUpdateRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Удалить пользователя.
    /// </summary>
    /// <returns>Количество удалённых записей (0, если пользователь не найден).</returns>
    Task<int> DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить количество пользователей.
    /// </summary>
    Task<int> CountAsync(CancellationToken cancellationToken = default);
}
