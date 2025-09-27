using TaskerApi.Interfaces.Core;
using TaskerApi.Interfaces.Models.Common;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Common.SqlFilters;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskStatus = TaskerApi.Models.Common.TaskStatus;

namespace TaskerApi.Services;

public class TaskService(
    ILogger<TaskService> logger,
    IUnitOfWorkFactory uowFactory,
    ICurrentUserService currentUser,
    ITaskProvider taskProvider,
    IGroupProvider groupProvider,
    IEventTaskService eventService
    )
    : ITaskService
{
    public async Task<IEnumerable<TaskResponse>> GetAsync(CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            // Получаем все задачи из групп, которые находятся в доступных пользователю областях
            var items = await taskProvider.GetListAsync(
                uow.Connection,
                cancellationToken,
                filers: [new ArraySqlFilter<Guid>(taskProvider.Table[nameof(TaskEntity.GroupId)].DbName, currentUser.AccessibleGroups.ToArray())],
                transaction: uow.Transaction);

            await uow.CommitAsync(cancellationToken);
            return items.Select(x => new TaskResponse
            {
                Id = x.Id,
                Title = x.Title,
                Description = x.Description,
                GroupId = x.GroupId,
                Status = x.Status,
                CreatorUserId = x.CreatorUserId,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt,
                IsActive = x.IsActive,
                DeactivatedAt = x.DeactivatedAt
            });
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<TaskResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var item = await taskProvider.GetByIdAsync(
                uow.Connection,
                id,
                cancellationToken,
                transaction: uow.Transaction);

            if (item == null || !currentUser.AccessibleGroups.Contains(item.GroupId))
            {
                await uow.CommitAsync(cancellationToken);
                return null;
            }

            await uow.CommitAsync(cancellationToken);
            return new TaskResponse
            {
                Id = item.Id,
                Title = item.Title,
                Description = item.Description,
                GroupId = item.GroupId,
                Status = item.Status,
                CreatorUserId = item.CreatorUserId,
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt,
                IsActive = item.IsActive,
                DeactivatedAt = item.DeactivatedAt
            };
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<TaskCreateResponse> CreateAsync(TaskCreateRequest request, CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            // Проверяем доступ к группе
            if (!currentUser.AccessibleGroups.Contains(request.GroupId))
            {
                throw new UnauthorizedAccessException("Нет доступа к указанной группе");
            }

            // Проверяем существование группы
            var group = await groupProvider.GetByIdAsync(
                uow.Connection,
                request.GroupId,
                cancellationToken,
                transaction: uow.Transaction);

            if (group == null)
            {
                throw new KeyNotFoundException("Группа не найдена");
            }

            var id = await taskProvider.CreateAsync(
                uow.Connection,
                new TaskEntity()
                {
                    Id = Guid.NewGuid(),
                    Title = request.Title,
                    Description = request.Description,
                    GroupId = request.GroupId,
                    CreatorUserId = currentUser.UserId,
                    Status = request.Status
                },
                cancellationToken,
                uow.Transaction,
                setDefaultValues: true);

            await eventService.AddEventCreateEntityAsync(uow, id, cancellationToken);

            await uow.CommitAsync(cancellationToken);
            return new TaskCreateResponse()
            {
                TaskId = id,
            };
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task UpdateAsync(Guid id, TaskUpdateRequest request, CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var existingItem = await taskProvider.GetByIdAsync(
                uow.Connection,
                id,
                cancellationToken,
                transaction: uow.Transaction);

            if (existingItem == null)
            {
                throw new KeyNotFoundException("Задача не найдена");
            }

            if (!currentUser.AccessibleGroups.Contains(existingItem.GroupId))
            {
                throw new UnauthorizedAccessException("Нет доступа к указанной задаче");
            }

            // Проверяем доступ к новой группе, если она изменилась
            if (existingItem.GroupId != request.GroupId && !currentUser.AccessibleGroups.Contains(request.GroupId))
            {
                throw new UnauthorizedAccessException("Нет доступа к указанной группе");
            }

            // Проверяем существование новой группы, если она изменилась
            if (existingItem.GroupId != request.GroupId)
            {
                var group = await groupProvider.GetByIdAsync(
                    uow.Connection,
                    request.GroupId,
                    cancellationToken,
                    transaction: uow.Transaction);

                if (group == null)
                {
                    throw new KeyNotFoundException("Группа не найдена");
                }
            }

            var oldTitle = existingItem.Title;
            var oldDescription = existingItem.Description;
            var oldGroupId = existingItem.GroupId;
            var oldStatus = existingItem.Status;

            existingItem.Title = request.Title;
            existingItem.Description = request.Description;
            existingItem.GroupId = request.GroupId;
            existingItem.Status = request.Status;

            await taskProvider.UpdateAsync(
                uow.Connection,
                existingItem,
                cancellationToken,
                transaction: uow.Transaction,
                setDefaultValues: true);

            var changes = new List<string>();
            if (oldTitle != request.Title)
                changes.Add($"Заголовок: '{oldTitle}' → '{request.Title}'");
            if (oldDescription != request.Description)
                changes.Add($"Описание: '{oldDescription}' → '{request.Description}'");
            if (oldGroupId != request.GroupId)
                changes.Add($"Группа: {oldGroupId} → {request.GroupId}");
            if (oldStatus != request.Status)
                changes.Add($"Статус: {oldStatus} → {request.Status}");

            await eventService.AddEventUpdateEntityAsync(
                uow, 
                id, 
                string.Join(", ", changes), 
                cancellationToken);

            await uow.CommitAsync(cancellationToken);
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var existingItem = await taskProvider.GetByIdAsync(
                uow.Connection,
                id,
                cancellationToken,
                transaction: uow.Transaction);

            if (existingItem == null)
            {
                throw new KeyNotFoundException("Задача не найдена");
            }

            if (!currentUser.AccessibleGroups.Contains(existingItem.GroupId))
            {
                throw new UnauthorizedAccessException("Нет доступа к указанной задаче");
            }

            await eventService.AddEventDeleteEntityAsync(uow, id, cancellationToken);

            await taskProvider.DeleteAsync(
                uow.Connection,
                id,
                cancellationToken,
                transaction: uow.Transaction);

            await uow.CommitAsync(cancellationToken);
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<IEnumerable<TaskSummaryResponse>> GetTaskSummaryByGroupAsync(Guid groupId, CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            // Проверяем доступ к группе
            if (!currentUser.AccessibleGroups.Contains(groupId))
            {
                throw new UnauthorizedAccessException("Нет доступа к указанной группе");
            }

            var tasks = await taskProvider.GetListAsync(
                uow.Connection,
                cancellationToken,
                filers: [new SimpleFilter<Guid>(taskProvider.Table[nameof(TaskEntity.GroupId)].DbName, groupId)],
                transaction: uow.Transaction);

            await uow.CommitAsync(cancellationToken);
            return tasks.Select(x => new TaskSummaryResponse
            {
                Id = x.Id,
                Title = x.Title,
                Description = x.Description,
                Status = x.Status
            });
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<IEnumerable<TaskWeeklyActivityResponse>> GetWeeklyActivityAsync(TaskWeeklyActivityRequest request, CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            // Получаем все задачи из доступных пользователю групп
            var tasks = await taskProvider.GetListAsync(
                uow.Connection,
                cancellationToken,
                filers: [new ArraySqlFilter<Guid>(taskProvider.Table[nameof(TaskEntity.GroupId)].DbName, currentUser.AccessibleGroups.ToArray())],
                transaction: uow.Transaction);

            await uow.CommitAsync(cancellationToken);

            // Генерируем случайные мок данные для активностей
            var random = new Random();
            var result = new List<TaskWeeklyActivityResponse>();

            foreach (var task in tasks.Where(t => t.IsActive))
            {
                var weekStart = GetFirstDayOfWeek(request.Year, request.WeekNumber);
                var days = new List<TaskDayActivityResponse>();

                // Генерируем активности для каждого дня недели
                for (int i = 0; i < 7; i++)
                {
                    var date = weekStart.AddDays(i);
                    var count = random.Next(0, 8); // 0-7 активностей в день
                    
                    days.Add(new TaskDayActivityResponse
                    {
                        Date = date.ToString("yyyy-MM-dd"),
                        Count = count
                    });
                }

                // Генерируем случайные значения для переноса и будущих активностей
                var carryWeeks = random.Next(0, 4); // 0-3 недели переноса
                var hasFutureActivities = random.Next(0, 2) == 1; // 50% вероятность

                result.Add(new TaskWeeklyActivityResponse
                {
                    TaskId = task.Id,
                    TaskName = task.Title,
                    CarryWeeks = carryWeeks,
                    HasFutureActivities = hasFutureActivities,
                    Days = days
                });
            }

            return result;
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }

    /// <summary>
    /// Получить первый день недели (понедельник) для указанного года и номера недели
    /// </summary>
    private static DateTime GetFirstDayOfWeek(int year, int weekNumber)
    {
        // Используем ISO 8601 стандарт для недель
        var jan1 = new DateTime(year, 1, 1);
        var daysOffset = DayOfWeek.Monday - jan1.DayOfWeek;
        
        // Если 1 января - воскресенье, то первая неделя начинается в предыдущем году
        if (daysOffset > 0)
            daysOffset -= 7;
            
        var firstMonday = jan1.AddDays(daysOffset);
        var firstWeek = GetIsoWeekOfYear(firstMonday);
        
        // Если первая неделя не содержит 4 января, то это последняя неделя предыдущего года
        if (firstWeek > 1)
        {
            firstMonday = firstMonday.AddDays(-7);
        }
        
        return firstMonday.AddDays((weekNumber - 1) * 7);
    }

    /// <summary>
    /// Получить номер недели по ISO 8601
    /// </summary>
    private static int GetIsoWeekOfYear(DateTime date)
    {
        var day = (int)date.DayOfWeek;
        if (day == 0) day = 7; // Воскресенье = 7
        
        var jan1 = new DateTime(date.Year, 1, 1);
        var daysOffset = day - (int)jan1.DayOfWeek;
        if (daysOffset < 0) daysOffset += 7;
        
        var weekNumber = ((date - jan1).Days + daysOffset) / 7 + 1;
        
        // Если неделя больше 52 и содержит менее 4 дней нового года, то это первая неделя
        if (weekNumber > 52)
        {
            var nextYearJan1 = new DateTime(date.Year + 1, 1, 1);
            var daysInWeek = 7 - day + 1;
            if (daysInWeek < 4)
                weekNumber = 1;
        }
        
        return weekNumber;
    }
}


