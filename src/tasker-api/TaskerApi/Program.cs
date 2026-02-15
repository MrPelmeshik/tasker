using TaskerApi.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddTaskerCors(builder.Configuration);
builder.Services.AddTaskerAuthentication(builder.Configuration);
builder.Services.AddSignalR();
builder.Services.AddTaskerServices(builder.Configuration);
builder.Services.AddTaskerSwagger();

builder.Services.AddAuthorization(options =>
{
    // Не устанавливаем FallbackPolicy, чтобы [AllowAnonymous] работал корректно
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("DefaultCors");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
var hubPath = app.Configuration["SignalR:HubPath"] ?? "/hubs/tasker";
app.MapHub<TaskerApi.Hubs.TaskerHub>(hubPath);

app.Run();
