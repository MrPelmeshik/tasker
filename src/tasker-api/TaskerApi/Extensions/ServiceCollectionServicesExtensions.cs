using Microsoft.EntityFrameworkCore;
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
/// Расширения регистрации сервисов (БД, репозитории, приложение) для Tasker API.
/// </summary>
public static partial class ServiceCollectionExtensions
{
    /// <summary>
    /// Добавляет все сервисы Tasker API (БД, репозитории, бизнес-сервисы).
    /// </summary>
    public static IServiceCollection AddTaskerServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("Строка подключения к базе данных не настроена. Задайте ConnectionStrings__DefaultConnection.");
        }

        services.Configure<DatabaseSettings>(options => options.ConnectionString = connectionString);
        services.Configure<RefreshTokenCleanupSettings>(configuration.GetSection("RefreshTokenCleanup"));
        services.Configure<SignalRSettings>(configuration.GetSection("SignalR"));
        services.Configure<AuthSettings>(configuration.GetSection("Auth"));
        services.Configure<TasksSettings>(configuration.GetSection("Tasks"));

        services.AddDbContext<TaskerDbContext>(options =>
        {
            var expandedConnectionString = ExpandEnvironmentVariables(connectionString);
            options.UseNpgsql(expandedConnectionString);
        });

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ITaskRepository, TaskRepository>();
        services.AddScoped<IAreaRepository, AreaRepository>();
        services.AddScoped<IFolderRepository, FolderRepository>();
        services.AddScoped<ISubtaskRepository, SubtaskRepository>();
        services.AddScoped<IPurposeRepository, PurposeRepository>();
        services.AddScoped<IEventRepository, EventRepository>();
        services.AddScoped<IUserLogRepository, UserLogRepository>();
        services.AddScoped<IUserAreaAccessRepository, UserAreaAccessRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

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
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IAreaService, AreaService>();
        services.AddScoped<IFolderService, FolderService>();
        services.AddScoped<IPurposeService, PurposeService>();
        services.AddScoped<ITaskService, TaskService>();
        services.AddScoped<ISubtaskService, SubtaskService>();
        services.AddScoped<IUserLogService, UserLogService>();
        services.AddScoped<IEventTaskService, EventTaskService>();
        services.AddScoped<IEventAreaService, EventAreaService>();
        services.AddScoped<IEntityEventLogger, EntityEventLogger>();
        services.AddScoped<IAreaRoleService, AreaRoleService>();
        services.AddScoped<IAreaMemberService, AreaMemberService>();
        services.AddScoped<IHubAreaAccessService, HubAreaAccessService>();
        services.AddSingleton<IConnectionAreaTracker, ConnectionAreaTracker>();
        services.AddScoped<IRealtimeNotifier, RealtimeNotifier>();
        services.AddHostedService<RefreshTokenCleanupHostedService>();

        return services;
    }
}
