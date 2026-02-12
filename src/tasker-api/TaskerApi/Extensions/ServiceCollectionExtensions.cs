using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using TaskerApi.Core;
using TaskerApi.Interfaces.Core;
using TaskerApi.Interfaces.Models.Entities;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Repositories;
using TaskerApi.Services;
using static TaskerApi.Core.DbConnectionFactory;

namespace TaskerApi.Extensions;

/// <summary>
/// Методы расширения для регистрации сервисов Tasker API
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Добавляет CORS для Tasker API
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

    /// <summary>
    /// Добавляет аутентификацию JWT и Negotiate
    /// </summary>
    public static IServiceCollection AddTaskerAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));

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

            options.RequireHttpsMetadata = false;
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
                ClockSkew = TimeSpan.FromSeconds(30)
            };
        })
        .AddNegotiate();

        return services;
    }

    /// <summary>
    /// Добавляет все сервисы Tasker API (БД, репозитории, бизнес-сервисы)
    /// </summary>
    public static IServiceCollection AddTaskerServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<DatabaseSettings>(configuration.GetSection("Database"));

        services.AddDbContext<TaskerDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? configuration["Database:ConnectionString"];

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Строка подключения к базе данных не настроена");
            }

            var expandedConnectionString = ExpandEnvironmentVariables(connectionString);
            options.UseNpgsql(expandedConnectionString);
        });

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ITaskRepository, TaskRepository>();
        services.AddScoped<IAreaRepository, AreaRepository>();
        services.AddScoped<IGroupRepository, GroupRepository>();
        services.AddScoped<ISubtaskRepository, SubtaskRepository>();
        services.AddScoped<IPurposeRepository, PurposeRepository>();
        services.AddScoped<IEventRepository, EventRepository>();
        services.AddScoped<IUserLogRepository, UserLogRepository>();
        services.AddScoped<IUserAreaAccessRepository, UserAreaAccessRepository>();

        services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();
        services.AddScoped<IUnitOfWorkFactory, UnitOfWorkFactory>();

        var dbEntityTypes = AppDomain.CurrentDomain.GetAssemblies()
            .SelectMany(a => a.GetTypes())
            .Where(t => typeof(IDbEntity).IsAssignableFrom(t) && t is { IsClass: true, IsAbstract: false })
            .ToList();

        foreach (var entityType in dbEntityTypes)
        {
            var tableMetaInfoType = typeof(TableMetaInfo<>).MakeGenericType(entityType);
            services.AddSingleton(tableMetaInfoType);
        }

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IAreaService, AreaService>();
        services.AddScoped<IGroupService, GroupService>();
        services.AddScoped<IPurposeService, PurposeService>();
        services.AddScoped<ITaskService, TaskService>();
        services.AddScoped<ISubtaskService, SubtaskService>();
        services.AddScoped<IUserLogService, UserLogService>();
        services.AddScoped<IEventTaskService, EventTaskService>();
        services.AddScoped<IEventGroupService, EventGroupService>();
        services.AddScoped<IEventAreaService, EventAreaService>();
        services.AddScoped<IEntityEventLogger, EntityEventLogger>();
        services.AddScoped<IAreaRoleService, AreaRoleService>();
        services.AddScoped<IAreaMemberService, AreaMemberService>();

        return services;
    }

    /// <summary>
    /// Добавляет Swagger с поддержкой JWT
    /// </summary>
    public static IServiceCollection AddTaskerSwagger(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "Tasker API", Version = "v1" });

            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                    },
                    Array.Empty<string>()
                }
            });
        });

        return services;
    }
}
