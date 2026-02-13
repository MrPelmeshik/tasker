namespace TaskerApi.Interfaces.Repositories;

/// <summary>
/// Репозиторий для работы с refresh-токенами (инвалидация при logout)
/// </summary>
public interface IRefreshTokenRepository
{
    /// <summary>
    /// Сохранить refresh-токен
    /// </summary>
    Task StoreAsync(Guid userId, string tokenHash, DateTimeOffset expiresAt, CancellationToken cancellationToken = default);

    /// <summary>
    /// Проверить, что токен существует, не отозван и не истёк
    /// </summary>
    /// <returns>True, если токен валиден</returns>
    Task<bool> IsValidAsync(string tokenHash, CancellationToken cancellationToken = default);

    /// <summary>
    /// Отозвать токен по хешу (logout)
    /// </summary>
    Task RevokeByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);

    /// <summary>
    /// Удалить истёкшие refresh-токены и отозванные старше указанного срока
    /// </summary>
    /// <param name="revokedMaxAge">Максимальный возраст отозванных токенов для удаления (например, 7 дней)</param>
    /// <param name="cancellationToken">Токен отмены</param>
    /// <returns>Количество удалённых записей</returns>
    Task<int> DeleteExpiredAndRevokedAsync(TimeSpan revokedMaxAge, CancellationToken cancellationToken = default);
}
