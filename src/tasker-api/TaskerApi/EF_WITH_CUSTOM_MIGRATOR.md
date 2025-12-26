# Entity Framework с собственным мигратором

## Обзор

Entity Framework Core может работать с уже существующей структурой БД без использования встроенных миграций. Это позволяет использовать собственный мигратор из `src/migrator/` для управления схемой БД.

## Преимущества такого подхода

1. **Гибкость** - полный контроль над процессом миграций
2. **Совместимость** - можно использовать существующие инструменты
3. **Простота** - не нужно изучать EF миграции
4. **Производительность** - оптимизированные SQL скрипты

## Как это работает

### 1. Entity Framework настраивается на существующую БД

```csharp
// В Program.cs
builder.Services.AddDbContext<TaskerDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseNpgsql(connectionString);
});
```

### 2. DbContext описывает структуру БД

```csharp
public class TaskerDbContext : DbContext
{
    public DbSet<UserEntity> Users { get; set; }
    public DbSet<TaskEntity> Tasks { get; set; }
    // ... остальные сущности
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Конфигурация сущностей
    }
}
```

### 3. Репозитории используют EF для работы с БД

```csharp
public class UserRepository : BaseRepository<UserEntity, Guid>
{
    public async Task<UserEntity?> GetByNameAsync(string name)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Name == name);
    }
}
```

## Процесс работы

### 1. Применение миграций
```bash
# Использовать собственный мигратор
cd src/migrator
dotnet run -- apply
```

### 2. Запуск приложения
```bash
# Запустить TaskerApi
cd src/tasker-api/TaskerApi
dotnet run
```

### 3. Использование репозиториев
```csharp
// В контроллерах или сервисах
public class UserController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    
    public UserController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }
    
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userRepository.GetAllAsync();
        return Ok(users);
    }
}
```

## Важные моменты

### 1. Структура БД должна соответствовать DbContext
- Названия таблиц и колонок должны совпадать
- Типы данных должны быть совместимы
- Связи между таблицами должны быть корректными

### 2. Конфигурация сущностей
```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<UserEntity>(entity =>
    {
        entity.ToTable("users"); // Указываем название таблицы
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Name).IsRequired();
        // ... остальная конфигурация
    });
}
```

### 3. Обработка изменений БД
- При изменении структуры БД через мигратор
- Обновить конфигурацию в DbContext
- Перезапустить приложение

## Отладка

### 1. Логирование SQL запросов
```json
// В appsettings.Development.json
{
  "Logging": {
    "LogLevel": {
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  }
}
```

### 2. Проверка подключения
```csharp
// В контроллере
public async Task<IActionResult> TestConnection()
{
    try
    {
        var userCount = await _userRepository.CountAsync();
        return Ok(new { message = "Connection successful", userCount });
    }
    catch (Exception ex)
    {
        return BadRequest(new { error = ex.Message });
    }
}
```

## Заключение

Такой подход позволяет:
- Использовать Entity Framework для удобной работы с БД
- Сохранить контроль над миграциями через собственный мигратор
- Получить все преимущества EF (типобезопасность, LINQ, отладка)
- Не изучать встроенные миграции EF

**Главное**: Структура БД должна соответствовать конфигурации в DbContext! 🎯
