namespace TaskerApi.Models.Configuration;

public class JwtSettings
{
    public string Issuer { get; set; } = "TaskerApi";
    public string Audience { get; set; } = "TaskerApiAudience";
    public string SecretKey { get; set; } = string.Empty;
    public int AccessTokenLifetimeMinutes { get; set; } = 60;
    public int RefreshTokenLifetimeDays { get; set; } = 7;
}


