namespace TaskerApi.Constants;

/// <summary>
/// Константы названий переменных окружения.
/// </summary>
public static class EnvName
{
    public const string Jwt = "Jwt";
    public const string DefaultConnection = "DefaultConnection";
    public const string RefreshTokenCleanup = "RefreshTokenCleanup";
    public const string SignalR = "SignalR";
    public const string Auth = "Auth";
    public const string Cors = "Cors";
    public const string Tasks = "Tasks";
    public const string HubPathBase = "HubPathBase";
    public const string AllowedOrigins = "AllowedOrigins";
    public const string AllowedOriginsCsv = "AllowedOriginsCsv";
    public const string JwtIssuer = "JwtIssuer";
    public const string JwtAudience = "JwtAudience";
    public const string JwtSecretKey = "JwtSecretKey";
}