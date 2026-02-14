namespace TaskerApi.Models.Common;

/// <summary>
/// Настройки фоновой очистки refresh-токенов.
/// </summary>
public class RefreshTokenCleanupSettings
{
    /// <summary>Задержка перед первым запуском очистки (минуты). По умолчанию 2.</summary>
    public int InitialDelayMinutes { get; set; } = 2;

    /// <summary>Интервал между запусками очистки (минуты). По умолчанию 60.</summary>
    public int IntervalMinutes { get; set; } = 60;

    /// <summary>Максимальный возраст отозванных токенов для удаления (дни). По умолчанию 7.</summary>
    public int RevokedMaxAgeDays { get; set; } = 7;
}
