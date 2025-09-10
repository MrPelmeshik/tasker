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

// Add services to the container.
builder.Services.AddControllers();

// Добавляем AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

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
    .Where(t => typeof(IDbEntity).IsAssignableFrom(t) && t.IsClass && !t.IsAbstract)
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

//

// Регистрация сервисов
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IAreaService, AreaService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

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
        var jwt = builder.Configuration.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();
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

// Optionally require auth by default; comment out if you want anonymous by default
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();