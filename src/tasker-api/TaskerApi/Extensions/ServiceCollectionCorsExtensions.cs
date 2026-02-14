namespace TaskerApi.Extensions;

/// <summary>
/// Расширения регистрации CORS для Tasker API.
/// </summary>
public static partial class ServiceCollectionExtensions
{
    /// <summary>
    /// Добавляет CORS для Tasker API. В production при пустых allowedOrigins выбрасывается исключение (AllowAnyOrigin несовместим с AllowCredentials).
    /// </summary>
    public static IServiceCollection AddTaskerCors(this IServiceCollection services, IConfiguration configuration)
    {
        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
        var allowedOriginsCsv = configuration["Cors:AllowedOriginsCsv"];
        if (!string.IsNullOrWhiteSpace(allowedOriginsCsv))
        {
            var csv = allowedOriginsCsv
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            allowedOrigins = allowedOrigins.Concat(csv).Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
        }

        var isProduction = string.Equals(configuration["ASPNETCORE_ENVIRONMENT"], "Production", StringComparison.OrdinalIgnoreCase);
        if (allowedOrigins.Length == 0 && isProduction)
            throw new InvalidOperationException("CORS: в production необходимо задать Cors:AllowedOrigins или Cors:AllowedOriginsCsv. AllowAnyOrigin несовместим с AllowCredentials.");

        services.AddCors(options =>
        {
            options.AddPolicy("DefaultCors", policy =>
            {
                if (allowedOrigins.Length > 0)
                {
                    policy.WithOrigins(allowedOrigins)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                }
                else
                {
                    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
                }
            });
        });

        return services;
    }
}
