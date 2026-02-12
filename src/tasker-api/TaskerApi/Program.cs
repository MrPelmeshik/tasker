using TaskerApi.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();
builder.Services.AddControllers();

builder.Services.AddTaskerCors(builder.Configuration);
builder.Services.AddTaskerAuthentication(builder.Configuration);
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

app.Run();
