namespace TaskerApi.Models.Common;

/// <summary>
/// Настройки SignalR (путь Hub, лимиты).
/// </summary>
public class SignalRSettings
{
    /// <summary>Полный путь Hub для маппинга. По умолчанию /hubs/tasker.</summary>
    public string HubPath { get; set; } = "/hubs/tasker";

    /// <summary>Базовый путь для извлечения JWT из query (например /hubs). По умолчанию /hubs.</summary>
    public string HubPathBase { get; set; } = "/hubs";

    /// <summary>Максимальное количество областей для подписки на одно соединение (защита от DoS). По умолчанию 100.</summary>
    public int MaxJoinAreasCount { get; set; } = 100;
}
