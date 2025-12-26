# Работа с транзакциями в Entity Framework

## Обзор

С Entity Framework подход к транзакциям кардинально изменился по сравнению с Dapper. EF автоматически управляет транзакциями через `SaveChanges()`, но также предоставляет гибкие возможности для ручного управления транзакциями.

## Основные принципы

### 1. Автоматические транзакции (по умолчанию)
```csharp
// EF автоматически создает транзакцию для каждого SaveChanges()
public async Task<UserEntity> CreateUserAsync(UserEntity user)
{
    _context.Users.Add(user);
    await _context.SaveChangesAsync(); // Автоматическая транзакция
    return user;
}
```

### 2. Явные транзакции
```csharp
// Для сложных операций с несколькими SaveChanges()
public async Task TransferMoneyAsync(Guid fromUserId, Guid toUserId, decimal amount, CancellationToken cancellationToken = default)
{
    using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    try
    {
        var fromUser = await _context.Users.FindAsync(fromUserId);
        var toUser = await _context.Users.FindAsync(toUserId);
        
        fromUser.Balance -= amount;
        toUser.Balance += amount;
        
        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }
    catch
    {
        await transaction.RollbackAsync(cancellationToken);
        throw;
    }
}
```

### 3. Транзакции с несколькими контекстами
```csharp
// Для операций с несколькими DbContext
public async Task ComplexOperationAsync(CancellationToken cancellationToken = default)
{
    using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    try
    {
        // Операции с первым контекстом
        await _context.SaveChangesAsync(cancellationToken);
        
        // Операции со вторым контекстом
        await _secondContext.SaveChangesAsync(cancellationToken);
        
        await transaction.CommitAsync(cancellationToken);
    }
    catch
    {
        await transaction.RollbackAsync(cancellationToken);
        throw;
    }
}
```

## Миграция с Dapper на EF

### Старый подход (Dapper + UnitOfWork)
```csharp
// ❌ Старый подход
public async Task<AreaResponse> CreateAreaAsync(CreateAreaRequest request)
{
    using var uow = await _unitOfWorkFactory.CreateAsync(cancellationToken, useTransaction: true);
    try
    {
        var area = new AreaEntity { /* ... */ };
        var id = await _areaProvider.CreateAsync(
            uow.Connection, 
            area, 
            cancellationToken, 
            transaction: uow.Transaction);
        
        await uow.CommitAsync(cancellationToken);
        return new AreaResponse { /* ... */ };
    }
    catch
    {
        await uow.RollbackAsync(cancellationToken);
        throw;
    }
}
```

### Новый подход (EF)
```csharp
// ✅ Новый подход
public async Task<AreaResponse> CreateAreaAsync(CreateAreaRequest request)
{
    var area = new AreaEntity { /* ... */ };
    var createdArea = await _areaRepository.CreateAsync(area, cancellationToken);
    
    return new AreaResponse { /* ... */ };
}
```

## Обновление сервисов

### 1. Удаление UnitOfWork из сервисов
```csharp
// ❌ Старый сервис
public class AreaService
{
    private readonly IAreaProvider _areaProvider;
    private readonly IUnitOfWorkFactory _unitOfWorkFactory;
    
    public async Task<AreaResponse> CreateAsync(CreateAreaRequest request)
    {
        using var uow = await _unitOfWorkFactory.CreateAsync(cancellationToken, useTransaction: true);
        // ... операции с uow
    }
}

// ✅ Новый сервис
public class AreaService
{
    private readonly IAreaRepository _areaRepository;
    
    public async Task<AreaResponse> CreateAsync(CreateAreaRequest request)
    {
        var area = new AreaEntity { /* ... */ };
        var createdArea = await _areaRepository.CreateAsync(area, cancellationToken);
        return new AreaResponse { /* ... */ };
    }
}
```

### 2. Обработка сложных транзакций
```csharp
// Для операций, требующих явного контроля транзакций
public async Task<ComplexOperationResponse> ComplexOperationAsync(ComplexRequest request)
{
    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
        // Создание области
        var area = new AreaEntity { /* ... */ };
        await _areaRepository.CreateAsync(area, cancellationToken);
        
        // Создание группы в области
        var group = new GroupEntity { AreaId = area.Id, /* ... */ };
        await _groupRepository.CreateAsync(group, cancellationToken);
        
        // Создание задач в группе
        var tasks = request.Tasks.Select(t => new TaskEntity 
        { 
            GroupId = group.Id, 
            /* ... */ 
        }).ToList();
        await _taskRepository.CreateAsync(tasks, cancellationToken);
        
        await transaction.CommitAsync();
        return new ComplexOperationResponse { /* ... */ };
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

## Паттерны для разных сценариев

### 1. Простые операции (автоматические транзакции)
```csharp
// EF автоматически управляет транзакциями
public async Task<UserEntity> GetUserAsync(Guid id)
{
    return await _userRepository.GetByIdAsync(id, cancellationToken);
}

public async Task<UserEntity> CreateUserAsync(CreateUserRequest request)
{
    var user = new UserEntity { /* ... */ };
    return await _userRepository.CreateAsync(user, cancellationToken);
}
```

### 2. Операции с валидацией (автоматические транзакции)
```csharp
public async Task<AreaEntity> CreateAreaAsync(CreateAreaRequest request)
{
    // Валидация
    var existingArea = await _areaRepository.GetByNameAsync(request.Name, cancellationToken);
    if (existingArea != null)
        throw new InvalidOperationException("Area already exists");
    
    // Создание
    var area = new AreaEntity { /* ... */ };
    return await _areaRepository.CreateAsync(area, cancellationToken);
}
```

### 3. Сложные операции (явные транзакции)
```csharp
public async Task<TransferResult> TransferTasksAsync(TransferTasksRequest request)
{
    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
        // Получение задач
        var tasks = await _taskRepository.GetByIdsAsync(request.TaskIds, cancellationToken);
        
        // Обновление группы для всех задач
        foreach (var task in tasks)
        {
            task.GroupId = request.NewGroupId;
            await _taskRepository.UpdateAsync(task, cancellationToken);
        }
        
        // Обновление статистики групп
        await UpdateGroupStatisticsAsync(request.OldGroupId, cancellationToken);
        await UpdateGroupStatisticsAsync(request.NewGroupId, cancellationToken);
        
        await transaction.CommitAsync();
        return new TransferResult { /* ... */ };
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

## Конфигурация транзакций

### 1. Настройка изоляции
```csharp
public async Task ComplexOperationAsync()
{
    using var transaction = await _context.Database.BeginTransactionAsync(
        IsolationLevel.ReadCommitted);
    try
    {
        // Операции
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

### 2. Асинхронные транзакции
```csharp
public async Task AsyncTransactionExampleAsync()
{
    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
        // Асинхронные операции
        var task1 = _userRepository.CreateAsync(user1, cancellationToken);
        var task2 = _userRepository.CreateAsync(user2, cancellationToken);
        
        await Task.WhenAll(task1, task2);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

## Лучшие практики

### 1. Используйте автоматические транзакции по умолчанию
```csharp
// ✅ Хорошо - простая операция
public async Task<UserEntity> CreateUserAsync(UserEntity user)
{
    return await _userRepository.CreateAsync(user, cancellationToken);
}

// ❌ Плохо - ненужная сложность
public async Task<UserEntity> CreateUserAsync(UserEntity user)
{
    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
        var result = await _userRepository.CreateAsync(user, cancellationToken);
        await transaction.CommitAsync();
        return result;
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

### 2. Используйте явные транзакции для сложных операций
```csharp
// ✅ Хорошо - сложная операция с несколькими сущностями
public async Task<ComplexResult> ComplexOperationAsync()
{
    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
        // Множественные операции
        await _userRepository.CreateAsync(user, cancellationToken);
        await _areaRepository.CreateAsync(area, cancellationToken);
        await _groupRepository.CreateAsync(group, cancellationToken);
        
        await transaction.CommitAsync();
        return new ComplexResult();
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

### 3. Обработка ошибок
```csharp
public async Task<Result> SafeOperationAsync()
{
    try
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Операции
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return Result.Success();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
    catch (DbUpdateException ex)
    {
        // Обработка ошибок БД
        return Result.Error("Database error occurred");
    }
    catch (Exception ex)
    {
        // Общая обработка ошибок
        return Result.Error("Operation failed");
    }
}
```

## Заключение

### Преимущества нового подхода:
1. **Простота** - автоматические транзакции для большинства операций
2. **Производительность** - EF оптимизирует транзакции
3. **Надежность** - автоматический rollback при ошибках
4. **Гибкость** - явные транзакции для сложных случаев

### Что нужно изменить:
1. **Удалить UnitOfWork** из сервисов
2. **Использовать репозитории** напрямую
3. **Добавить явные транзакции** только для сложных операций
4. **Обновить обработку ошибок** под EF

**Главное правило**: Начинайте с автоматических транзакций, добавляйте явные только при необходимости! 🎯
