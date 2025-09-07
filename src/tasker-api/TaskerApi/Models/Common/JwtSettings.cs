namespace TaskerApi.Models.Common;

public class JwtSettings
{
    public string Issuer { get; set; } = "TaskerApi";//todo: Вынести в переменные окружения
    public string Audience { get; set; } = "TaskerApiAudience";//todo: Вынести в переменные окружения
    public string SecretKey { get; set; } = string.Empty;
    public int AccessTokenLifetimeMinutes { get; set; } = 60; //todo: Вынести в переменные окружения
    public int RefreshTokenLifetimeDays { get; set; } = 7; //todo: Вынести в переменные окружения
}


