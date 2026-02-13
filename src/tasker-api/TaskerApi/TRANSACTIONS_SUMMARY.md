# Резюме по работе с транзакциями в Entity Framework

## Основные изменения

### ❌ Старый подход (Dapper + UnitOfWork)
```csharp
// Сложный и многословный код
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

### ✅ Новый подход (EF)
```csharp
// Простой и понятный код
public async Task<AreaResponse> CreateAreaAsync(CreateAreaRequest request)
{
    var area = new AreaEntity { /* ... */ };
    var createdArea = await _areaRepository.CreateAsync(area, cancellationToken);
    return new AreaResponse { /* ... */ };
}
```

## Типы транзакций в EF

### 1. Автоматические транзакции (по умолчанию)
- **Когда использовать**: Простые операции (CRUD)
- **Преимущества**: Простота, автоматический rollback при ошибках
- **Примеры**: Создание, обновление, удаление одной сущности

```csharp
// EF автоматически создает транзакцию
public async Task<UserEntity> CreateUserAsync(UserEntity user)
{
    return await _userRepository.CreateAsync(user, cancellationToken);
}
```

### 2. Явные транзакции
- **Когда использовать**: Сложные операции с несколькими сущностями
- **Преимущества**: Полный контроль, возможность отката
- **Примеры**: Создание области с папкой, перевод задач между папками

```csharp
// Явное управление транзакцией
public async Task<ComplexResult> ComplexOperationAsync()
{
    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
        await _areaRepository.CreateAsync(area, cancellationToken);
        await _folderRepository.CreateAsync(folder, cancellationToken);
        await _userAccessRepository.CreateAsync(access, cancellationToken);
        
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

## Миграция сервисов

### Шаг 1: Удалить UnitOfWork
```csharp
// ❌ Удалить
private readonly IUnitOfWorkFactory _unitOfWorkFactory;

// ❌ Удалить
using var uow = await _unitOfWorkFactory.CreateAsync(cancellationToken, useTransaction: true);
```

### Шаг 2: Добавить репозитории
```csharp
// ✅ Добавить
private readonly IAreaRepository _areaRepository;
private readonly IFolderRepository _folderRepository;
```

### Шаг 3: Упростить методы
```csharp
// ❌ Старый метод
public async Task<AreaResponse> CreateAsync(CreateAreaRequest request)
{
    using var uow = await _unitOfWorkFactory.CreateAsync(cancellationToken, true);
    try
    {
        var area = new AreaEntity { /* ... */ };
        var id = await _areaProvider.CreateAsync(uow.Connection, area, cancellationToken, uow.Transaction);
        await uow.CommitAsync(cancellationToken);
        return new AreaResponse { /* ... */ };
    }
    catch
    {
        await uow.RollbackAsync(cancellationToken);
        throw;
    }
}

// ✅ Новый метод
public async Task<AreaResponse> CreateAsync(CreateAreaRequest request)
{
    var area = new AreaEntity { /* ... */ };
    var createdArea = await _areaRepository.CreateAsync(area, cancellationToken);
    return new AreaResponse { /* ... */ };
}
```

## Паттерны для разных сценариев

### Простые операции (автоматические транзакции)
```csharp
// ✅ Хорошо - EF автоматически управляет транзакцией
public async Task<UserEntity> GetUserAsync(Guid id)
{
    return await _userRepository.GetByIdAsync(id, cancellationToken);
}

public async Task<UserEntity> CreateUserAsync(UserEntity user)
{
    return await _userRepository.CreateAsync(user, cancellationToken);
}
```

### Сложные операции (явные транзакции)
```csharp
// ✅ Хорошо - явная транзакция для сложной операции
public async Task<TransferResult> TransferTasksAsync(TransferTasksRequest request, CancellationToken cancellationToken = default)
{
    using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    try
    {
        var tasks = await _taskRepository.GetByIdsAsync(request.TaskIds, cancellationToken);
        foreach (var task in tasks)
        {
            task.FolderId = request.NewFolderId;
            await _taskRepository.UpdateAsync(task, cancellationToken);
        }
        await transaction.CommitAsync(cancellationToken);
        return new TransferResult();
    }
    catch
    {
        await transaction.RollbackAsync(cancellationToken);
        throw;
    }
}
```

## Лучшие практики

### 1. Используйте автоматические транзакции по умолчанию
- Простые CRUD операции
- Одна сущность за раз
- Стандартная обработка ошибок

### 2. Используйте явные транзакции для сложных операций
- Несколько сущностей
- Связанные операции
- Требуется атомарность

### 3. Обработка ошибок
```csharp
public async Task<Result> SafeOperationAsync(CancellationToken cancellationToken = default)
{
    try
    {
        using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            // Операции
            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return Result.Success();
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
    catch (DbUpdateException ex)
    {
        return Result.Error("Database error occurred");
    }
    catch (Exception ex)
    {
        return Result.Error("Operation failed");
    }
}
```

## Преимущества нового подхода

1. **Простота** - меньше кода, больше читаемости
2. **Производительность** - EF оптимизирует транзакции
3. **Надежность** - автоматический rollback при ошибках
4. **Гибкость** - явные транзакции для сложных случаев
5. **Типобезопасность** - строгая типизация EF

## Что нужно изменить

1. **Удалить UnitOfWork** из всех сервисов
2. **Заменить провайдеры** на репозитории
3. **Упростить методы** сервисов
4. **Добавить явные транзакции** только для сложных операций
5. **Обновить обработку ошибок** под EF

**Главное правило**: Начинайте с автоматических транзакций, добавляйте явные только при необходимости! 🎯
