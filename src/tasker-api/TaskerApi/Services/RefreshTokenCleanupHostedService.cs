using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TaskerApi.Interfaces.Repositories;

namespace TaskerApi.Services;

/// <summary>
/// Фоновый сервис периодической очистки истёкших и старых отозванных refresh-токенов
/// </summary>
public class RefreshTokenCleanupHostedService(
    IServiceProvider serviceProvider,
    ILogger<RefreshTokenCleanupHostedService> logger)
    : BackgroundService
{
    /// <summary>
    /// Задержка перед первым проходом очистки (2 минуты)
    /// </summary>
    private static readonly TimeSpan InitialDelay = TimeSpan.FromMinutes(2);

    /// <summary>
    /// Интервал очистки (1 час)
    /// </summary>
    private static readonly TimeSpan CleanupInterval = TimeSpan.FromHours(1);

    /// <summary>
    /// Максимальный возраст отозванных токенов для удаления (7 дней)
    /// </summary>
    private static readonly TimeSpan RevokedMaxAge = TimeSpan.FromDays(7);

    /// <inheritdoc />
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Delay(InitialDelay, stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupAsync(stoppingToken);
                await Task.Delay(CleanupInterval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Ошибка очистки refresh-токенов");
            }
        }
    }

    private async Task CleanupAsync(CancellationToken cancellationToken)
    {
        using var scope = serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IRefreshTokenRepository>();
        var deleted = await repository.DeleteExpiredAndRevokedAsync(RevokedMaxAge, cancellationToken);
        if (deleted > 0)
            logger.LogInformation("Удалено refresh-токенов: {Count}", deleted);
    }
}
