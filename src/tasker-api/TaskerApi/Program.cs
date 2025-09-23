using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using TaskerApi.Core;
using TaskerApi.Models.Entities.Contracts;
using TaskerApi.Services;
using TaskerApi.Interfaces.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Providers;

var builder = WebApplication.CreateBuilder(args);

// Добавляем переменные окружения как источник конфигурации
builder.Configuration.AddEnvironmentVariables();

// Add services to the container.
builder.Services.AddControllers();

// Добавляем AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Конфигурация CORS из переменных окружения/конфига
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
var allowedOriginsCsv = builder.Configuration["Cors:AllowedOriginsCsv"];
if (!string.IsNullOrWhiteSpace(allowedOriginsCsv))
{
	var csv = allowedOriginsCsv
		.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
	allowedOrigins = allowedOrigins.Concat(csv).Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
}

builder.Services.AddCors(options =>
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
			// Без заданных origins разрешаем любые запросы БЕЗ учёта куки (не для refresh)
			policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
		}
	});
});

// Конфигурация настроек базы данных
builder.Services.Configure<DatabaseSettings>(builder.Configuration.GetSection("Database"));

// Регистрация инфраструктуры БД
builder.Services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();
builder.Services.AddScoped<IUnitOfWorkFactory, UnitOfWorkFactory>();

// Ресгистрация суностей БД
// Механизм для создания TableMetaInfo для всех классов, реализующих IDbEntity

// Получаем все типы, реализующие IDbEntity
var dbEntityTypes = AppDomain.CurrentDomain.GetAssemblies()
    .SelectMany(a => a.GetTypes())
    .Where(t => typeof(IDbEntity).IsAssignableFrom(t) && t is { IsClass: true, IsAbstract: false })
    .ToList();

// Создаём TableMetaInfo для каждого типа и регистрируем как singleton
foreach (var tableMetaInfoType in dbEntityTypes
             .Select(entityType => typeof(TableMetaInfo<>)
                 .MakeGenericType(entityType)))
{
	builder.Services.AddSingleton(tableMetaInfoType);
}


// Регистрация провайдеров (Dapper)
builder.Services.AddScoped<IUserLogProvider, UserLogProvider>();
builder.Services.AddScoped<IUserProvider, UserProvider>();
builder.Services.AddScoped<IEventProvider, EventProvider>();
builder.Services.AddScoped<IEventToAreaByEventProvider, EventToAreaByEventProvider>();
builder.Services.AddScoped<IEventToAreaByAreaProvider, EventToAreaByAreaProvider>();
builder.Services.AddScoped<IEventToGroupByEventProvider, EventToGroupByEventProvider>();
builder.Services.AddScoped<IEventToGroupByGroupProvider, EventToGroupByGroupProvider>();
builder.Services.AddScoped<IEventToPurposeByEventProvider, EventToPurposeByEventProvider>();
builder.Services.AddScoped<IEventToPurposeByPurposeProvider, EventToPurposeByPurposeProvider>();
builder.Services.AddScoped<IEventToSubtaskByEventProvider, EventToSubtaskByEventProvider>();
builder.Services.AddScoped<IEventToSubtaskBySubtaskProvider, EventToSubtaskBySubtaskProvider>();
builder.Services.AddScoped<IEventToTaskByEventProvider, EventToTaskByEventProvider>();
builder.Services.AddScoped<IEventToTaskByTaskProvider, EventToTaskByTaskProvider>();
builder.Services.AddScoped<IAreaProvider, AreaProvider>();
builder.Services.AddScoped<IGroupProvider, GroupProvider>();
builder.Services.AddScoped<IPurposeProvider, PurposeProvider>();
builder.Services.AddScoped<ITaskProvider, TaskProvider>();
builder.Services.AddScoped<ISubtaskProvider, SubtaskProvider>();
builder.Services.AddScoped<IUserAreaAccessProvider, UserAreaAccessProvider>();

//

// Регистрация сервисов
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IAreaService, AreaService>();
builder.Services.AddScoped<IGroupService, GroupService>();
builder.Services.AddScoped<IPurposeService, PurposeService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<ISubtaskService, SubtaskService>();
builder.Services.AddScoped<IUserLogService, UserLogService>();

// Регистрация атрибута логирования как сервис-фильтра
// builder.Services.AddScoped<UserLogAttribute>();

// Configure Settings

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

// Configure authentication: JWT as default + Negotiate
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        var jwt = builder.Configuration.GetSection("Jwt").Get<JwtSettings>();
        if (jwt == null || string.IsNullOrEmpty(jwt.SecretKey) || string.IsNullOrEmpty(jwt.Issuer) || string.IsNullOrEmpty(jwt.Audience))
        {
            throw new InvalidOperationException("JWT configuration is missing or incomplete. Please ensure JWT_ISSUER, JWT_AUDIENCE, and JWT_SECRET_KEY environment variables are set.");
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

// builder.Services.AddAuthorization();

// Configure authorization policies
builder.Services.AddAuthorization(options =>
{
    // Не устанавливаем FallbackPolicy, чтобы [AllowAnonymous] работал корректно
    // Можно добавить именованные политики для конкретных ролей при необходимости
});



/*builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("admin", policy => policy.RequireRole("admin"));
    options.AddPolicy("manager", policy => policy.RequireRole("manager"));
    options.AddPolicy("user", policy => policy.RequireRole("user"));
});*/

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Tasker API", Version = "v1" });

    // Добавляем поддержку JWT в Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    var requirement = new OpenApiSecurityRequirement
    { { new OpenApiSecurityScheme
    {
        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
    }, [] } };
    c.AddSecurityRequirement(requirement);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseCors("DefaultCors");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();