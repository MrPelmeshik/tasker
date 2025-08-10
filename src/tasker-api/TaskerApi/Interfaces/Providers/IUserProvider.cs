using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Providers;

/// <summary>
/// Интерфейс провайдера для работы с пользователями.
/// </summary>
public interface IUserProvider : ICrudProvider<UserEntity, Guid>
{
    /// <summary>
    /// Получить пользователей по области.
    /// </summary>
    Task<IEnumerable<UserEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить активных пользователей.
    /// </summary>
    Task<IEnumerable<UserEntity>> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить пользователя по SSO субъекту.
    /// </summary>
    Task<UserEntity?> GetBySsoSubjectAsync(string idp, string ssoSubject, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить пользователя по email.
    /// </summary>
    Task<UserEntity?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
}
