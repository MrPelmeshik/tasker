using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text.Json;
using TaskerApi.Models.Configuration;
using TaskerApi.Infrastructure;
using TaskerApi.Attributes;
using TaskerApi.Interfaces.Entities;
using TaskerApi.Providers;
using TaskerApi.Services;
using TaskerApi.Interfaces.Infrastructure;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;

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
// builder.Services.AddScoped<IUserProvider, UserProvider>();
builder.Services.AddScoped<IUserLogProvider, UserLogProvider>();
builder.Services.AddScoped<IEventProvider, EventProvider>();
builder.Services.AddScoped<IEventToAreaByEventProvider, EventToAreaByEventProvider>();
builder.Services.AddScoped<IEventToAreaByAreaProvider, EventToAreaByAreaProvider>();
builder.Services.AddScoped<IEventToGroupByEventProvider, EventToGroupByEventProvider>();

// Регистрация провайдеров Keycloak
// builder.Services.AddHttpClient<IKeycloakProvider, KeycloakProvider>();
// builder.Services.AddScoped<IKeycloakProvider, KeycloakProvider>();

// Регистрация сервисов
builder.Services.AddScoped<IEventService, EventService>();
// builder.Services.AddScoped<IUserService, UserService>();
// builder.Services.AddScoped<IAuthService, AuthService>();

// Регистрация атрибута логирования как сервис-фильтра
// builder.Services.AddScoped<UserLogAttribute>();

// Configure Keycloak settings
/*builder.Services.Configure<KeycloakSettings>(
    builder.Configuration.GetSection("Keycloak"));*/

// Configure authentication
/*
var keycloakSettings = builder.Configuration.GetSection("Keycloak").Get<KeycloakSettings>();
if (keycloakSettings != null)
{
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = keycloakSettings.Authority;
            options.Audience = keycloakSettings.Audience;
            options.RequireHttpsMetadata = keycloakSettings.RequireHttpsMetadata;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = keycloakSettings.ValidateIssuer,
                ValidateAudience = keycloakSettings.ValidateAudience,
                ValidateLifetime = keycloakSettings.ValidateLifetime,
                ValidateIssuerSigningKey = keycloakSettings.ValidateIssuerSigningKey,
                RequireSignedTokens = true,
                RequireExpirationTime = true,
                NameClaimType = "preferred_username",
                RoleClaimType = ClaimTypes.Role
            };

            // Map Keycloak roles (realm and client) to ASP.NET Core roles
            options.Events = new JwtBearerEvents
            {
                OnTokenValidated = context =>
                {
                    if (context.Principal?.Identity is not ClaimsIdentity identity)
                    {
                        return Task.CompletedTask;
                    }

                    var addedRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                    // realm_access.roles
                    var realmAccess = context.Principal.FindFirst("realm_access")?.Value;
                    if (!string.IsNullOrWhiteSpace(realmAccess))
                    {
                        try
                        {
                            using var doc = JsonDocument.Parse(realmAccess);
                            if (doc.RootElement.TryGetProperty("roles", out var rolesEl) &&
                                rolesEl.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var role in rolesEl
                                             .EnumerateArray()
                                             .Select(roleEl => roleEl.GetString())
                                             .Where(role => !string.IsNullOrWhiteSpace(role) && addedRoles.Add(role)))
                                {
                                    identity.AddClaim(new Claim(ClaimTypes.Role, role ?? throw new ArgumentNullException(nameof(role))));
                                }
                            }
                        }
                        catch
                        {
                            // ignore parse errors
                        }
                    }

                    // resource_access[clientId].roles
                    var resourceAccess = context.Principal.FindFirst("resource_access")?.Value;
                    if (string.IsNullOrWhiteSpace(resourceAccess)) return Task.CompletedTask;

                    try
                    {
                        using var doc = JsonDocument.Parse(resourceAccess);
                        if (doc.RootElement.TryGetProperty(keycloakSettings.ClientId, out var clientEl))
                        {
                            if (clientEl.TryGetProperty("roles", out var rolesEl) &&
                                rolesEl.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var role in rolesEl
                                             .EnumerateArray()
                                             .Select(roleEl => roleEl.GetString())
                                             .Where(role => !string.IsNullOrWhiteSpace(role) && addedRoles.Add(role)))
                                {
                                    identity.AddClaim(new Claim(ClaimTypes.Role, role ?? throw new ArgumentNullException(nameof(role))));
                                }
                            }
                        }
                    }
                    catch
                    {
                        // ignore parse errors
                    }

                    return Task.CompletedTask;
                }
            };
        });
}
*/

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
    /*c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
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
    c.AddSecurityRequirement(requirement);*/
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();