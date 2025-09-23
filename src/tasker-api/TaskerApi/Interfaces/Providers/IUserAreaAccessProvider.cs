using System.Data;
using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Providers;

/// <summary>
/// Провайдер для работы с правами доступа пользователей к областям
/// </summary>
public interface IUserAreaAccessProvider : IBaseProvider<UserAreaAccessEntity, Guid>
{
    /// <summary>
    /// Получить список областей, к которым у пользователя есть доступ
    /// </summary>
    /// <param name="connection">Соединение с БД</param>
    /// <param name="userId">ID пользователя</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="transaction">Транзакция</param>
    /// <returns>Список ID областей</returns>
    Task<IReadOnlyList<Guid>> GetUserAccessibleAreaIdsAsync(
        IDbConnection connection, 
        Guid userId, 
        CancellationToken cancellationToken, 
        IDbTransaction? transaction = null);

    /// <summary>
    /// Предоставить доступ пользователю к области
    /// </summary>
    /// <param name="connection">Соединение с БД</param>
    /// <param name="userId">ID пользователя</param>
    /// <param name="areaId">ID области</param>
    /// <param name="grantedByUserId">ID пользователя, предоставляющего доступ</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="transaction">Транзакция</param>
    /// <returns>ID созданной записи</returns>
    Task<Guid> GrantAccessAsync(
        IDbConnection connection, 
        Guid userId, 
        Guid areaId, 
        Guid grantedByUserId, 
        CancellationToken cancellationToken, 
        IDbTransaction? transaction = null);

    /// <summary>
    /// Отозвать доступ пользователя к области
    /// </summary>
    /// <param name="connection">Соединение с БД</param>
    /// <param name="userId">ID пользователя</param>
    /// <param name="areaId">ID области</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <param name="transaction">Транзакция</param>
    /// <returns>Количество затронутых записей</returns>
    Task<int> RevokeAccessAsync(
        IDbConnection connection, 
        Guid userId, 
        Guid areaId, 
        CancellationToken cancellationToken, 
        IDbTransaction? transaction = null);
}
