namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Сервис получения списка областей, к которым пользователь имеет доступ (для SignalR Hub)
/// </summary>
public interface IHubAreaAccessService
{
    /// <summary>
    /// Получить идентификаторы областей, к которым пользователь имеет доступ
    /// </summary>
    /// <param name="userId">Идентификатор пользователя</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Список areaIds</returns>
    Task<IReadOnlyList<Guid>> GetAccessibleAreaIdsAsync(Guid userId, CancellationToken cancellationToken = default);
}
