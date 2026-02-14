using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Models.Common;

namespace TaskerApi.Services;

/// <summary>
/// Фоновый сервис периодической очистки истёкших и старых отозванных refresh-токенов
/// </summary>
public class RefreshTokenCleanupHostedService(
    IServiceProvider serviceProvider,
    IOptions<RefreshTokenCleanupSettings> options,
    ILogger<RefreshTokenCleanupHostedService> logger)
    : BackgroundService
{
    /// <inheritdoc />
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var settings = options.Value;
        var initialDelay = TimeSpan.FromMinutes(settings.InitialDelayMinutes > 0 ? settings.InitialDelayMinutes : 2);
        var cleanupInterval = TimeSpan.FromMinutes(settings.IntervalMinutes > 0 ? settings.IntervalMinutes : 60);

        await Task.Delay(initialDelay, stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupAsync(stoppingToken);
                await Task.Delay(cleanupInterval, stoppingToken);
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
        var settings = options.Value;
        var revokedMaxAge = TimeSpan.FromDays(settings.RevokedMaxAgeDays > 0 ? settings.RevokedMaxAgeDays : 7);
        using var scope = serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IRefreshTokenRepository>();
        var deleted = await repository.DeleteExpiredAndRevokedAsync(revokedMaxAge, cancellationToken);
        if (deleted > 0)
            logger.LogInformation("Удалено refresh-токенов: {Count}", deleted);
    }
}
