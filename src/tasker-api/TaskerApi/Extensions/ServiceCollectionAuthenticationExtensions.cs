using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using TaskerApi.Models.Common;

namespace TaskerApi.Extensions;

/// <summary>
/// Расширения регистрации аутентификации для Tasker API.
/// </summary>
public static partial class ServiceCollectionExtensions
{
    /// <summary>
    /// Добавляет аутентификацию JWT и Negotiate.
    /// </summary>
    public static IServiceCollection AddTaskerAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
        services.Configure<SignalRSettings>(configuration.GetSection("SignalR"));

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            var jwt = configuration.GetSection("Jwt").Get<JwtSettings>();
            if (jwt == null || string.IsNullOrEmpty(jwt.SecretKey) || string.IsNullOrEmpty(jwt.Issuer) || string.IsNullOrEmpty(jwt.Audience))
            {
                throw new InvalidOperationException("Конфигурация JWT отсутствует или неполная. Пожалуйста, убедитесь, что переменные окружения JWT_ISSUER, JWT_AUDIENCE и JWT_SECRET_KEY установлены.");
            }

            options.RequireHttpsMetadata = jwt.RequireHttpsMetadata;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwt.Issuer,
                ValidateAudience = true,
                ValidAudience = jwt.Audience,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwt.SecretKey)),
                NameClaimType = ClaimTypes.Name,
                RoleClaimType = ClaimTypes.Role,
                ClockSkew = TimeSpan.FromSeconds(jwt.ClockSkewSeconds > 0 ? jwt.ClockSkewSeconds : 30)
            };
            var hubPathBase = configuration["SignalR:HubPathBase"] ?? "/hubs";
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments(hubPathBase))
                    {
                        context.Token = accessToken;
                    }
                    return Task.CompletedTask;
                }
            };
        })
        .AddNegotiate();

        return services;
    }
}
