using System.Globalization;
using Microsoft.EntityFrameworkCore;
using TaskerApi.Core;
using TaskerApi.Helpers;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Services.Base;
using TaskerApi.Services.Mapping;
using TaskStatus = TaskerApi.Models.Common.TaskStatus;
using EventType = TaskerApi.Models.Common.EventType;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для работы с задачами с использованием Entity Framework
/// </summary>
public class TaskService(
    ILogger<TaskService> logger,
    ICurrentUserService currentUser,
    ITaskRepository taskRepository,
    IAreaRepository areaRepository,
    IFolderRepository folderRepository,
    IEventRepository eventRepository,
    IUserRepository userRepository,
    IEntityEventLogger entityEventLogger,
    IAreaRoleService areaRoleService,
    TaskerDbContext context)
    : BaseService(logger, currentUser), ITaskService
{
    /// <summary>
    /// Получить все задачи
    /// </summary>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Список всех доступных задач</returns>
    public async Task<IEnumerable<TaskResponse>> GetAsync(CancellationToken cancellationToken)
    {
        try
        {
            var tasks = await taskRepository.GetAllAsync(cancellationToken);
            var accessibleTasks = tasks.Where(t => CurrentUser.HasAccessToArea(t.AreaId)).ToList();

            return accessibleTasks.Select(t => t.ToTaskResponse());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка получения задач");
            throw;
        }
    }

    /// <summary>
    /// Получить задачу по идентификатору
    /// </summary>
    /// <param name="id">Идентификатор задачи</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Задача или null, если не найдена</returns>
    public async Task<TaskResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var task = await taskRepository.GetByIdAsync(id, cancellationToken);
            if (task == null)
            {
                return null;
            }

            if (!CurrentUser.HasAccessToArea(task.AreaId))
                return null;

            var user = await userRepository.GetByIdAsync(task.OwnerUserId, cancellationToken);
            return task.ToTaskResponse(user?.Name ?? "");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка получения задачи по идентификатору {TaskId}", id);
            throw;
        }
    }

    /// <summary>
    /// Создать новую задачу
    /// </summary>
    /// <param name="request">Данные для создания задачи</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Созданная задача</returns>
    public async Task<TaskResponse> CreateAsync(TaskCreateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var area = await areaRepository.GetByIdAsync(request.AreaId, cancellationToken);
            if (area == null)
                throw new InvalidOperationException("Область не найдена");

            if (!CurrentUser.HasAccessToArea(request.AreaId))
                throw new UnauthorizedAccessException("Доступ к области запрещен");

            if (request.FolderId.HasValue)
            {
                var folder = await folderRepository.GetByIdAsync(request.FolderId.Value, cancellationToken);
                if (folder == null || folder.AreaId != request.AreaId)
                    throw new InvalidOperationException("Папка не найдена или принадлежит другой области");
            }

            if (!await areaRoleService.CanEditTaskAsync(request.AreaId, cancellationToken))
                throw new UnauthorizedAccessException("Нет прав на создание задач в области");

            var task = request.ToTaskEntity(currentUser.UserId);

            var createdTask = await taskRepository.CreateAsync(task, cancellationToken);

            await entityEventLogger.LogAsync(EntityType.TASK, createdTask.Id, EventType.CREATE, createdTask.Title, null, cancellationToken);

            return createdTask.ToTaskResponse();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка создания задачи");
            throw;
        }
    }

    /// <summary>
    /// Обновить задачу
    /// </summary>
    /// <param name="id">Идентификатор задачи</param>
    /// <param name="request">Данные для обновления</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Обновленная задача</returns>
    public async Task<TaskResponse> UpdateAsync(Guid id, TaskUpdateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var task = await taskRepository.GetByIdAsync(id, cancellationToken);
            if (task == null)
            {
                throw new InvalidOperationException("Задача не найдена");
            }

            if (!CurrentUser.HasAccessToArea(task.AreaId))
                throw new UnauthorizedAccessException("Доступ к задаче запрещен");

            if (!await areaRoleService.CanEditTaskAsync(task.AreaId, cancellationToken))
                throw new UnauthorizedAccessException("Нет прав на редактирование задачи");

            if (request.AreaId != task.AreaId || request.FolderId != task.FolderId)
            {
                if (!CurrentUser.HasAccessToArea(request.AreaId))
                    throw new UnauthorizedAccessException("Доступ к целевой области запрещен");
                var area = await areaRepository.GetByIdAsync(request.AreaId, cancellationToken);
                if (area == null)
                    throw new InvalidOperationException("Целевая область не найдена");
                if (request.FolderId.HasValue)
                {
                    var folder = await folderRepository.GetByIdAsync(request.FolderId.Value, cancellationToken);
                    if (folder == null || folder.AreaId != request.AreaId)
                        throw new InvalidOperationException("Целевая папка не найдена или в другой области");
                }
                if (!await areaRoleService.CanEditTaskAsync(request.AreaId, cancellationToken))
                    throw new UnauthorizedAccessException("Нет прав на редактирование в целевой области");
            }

            var oldSnapshot = EventMessageHelper.ShallowClone(task);

            request.UpdateTaskEntity(task);

            await taskRepository.UpdateAsync(task, cancellationToken);

            var messageJson = EventMessageHelper.BuildUpdateMessageJson(oldSnapshot, task);

            await entityEventLogger.LogAsync(EntityType.TASK, id, EventType.UPDATE, task.Title, messageJson, cancellationToken);

            return task.ToTaskResponse();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка обновления задачи {TaskId}", id);
            throw;
        }
    }

    /// <summary>
    /// Удалить задачу
    /// </summary>
    /// <param name="id">Идентификатор задачи</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var task = await taskRepository.GetByIdAsync(id, cancellationToken);
            if (task == null)
            {
                throw new InvalidOperationException("Задача не найдена");
            }

            if (!CurrentUser.HasAccessToArea(task.AreaId))
                throw new UnauthorizedAccessException("Доступ к задаче запрещен");

            if (!await areaRoleService.CanCreateOrDeleteStructureAsync(task.AreaId, cancellationToken))
                throw new UnauthorizedAccessException("Только владелец области может удалять задачи");

            await entityEventLogger.LogAsync(EntityType.TASK, id, EventType.DELETE, task.Title, null, cancellationToken);

            await taskRepository.DeleteAsync(id, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка удаления задачи {TaskId}", id);
            throw;
        }
    }

    /// <summary>
    /// Создать задачу с событием (сложная операция с явной транзакцией)
    /// </summary>
    /// <param name="request">Данные для создания задачи с событием</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Созданная задача с событием</returns>
    public async Task<TaskWithEventResponse> CreateWithEventAsync(CreateTaskWithEventRequest request, CancellationToken cancellationToken)
    {
        using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var area = await areaRepository.GetByIdAsync(request.AreaId, cancellationToken);
            if (area == null)
                throw new InvalidOperationException("Область не найдена");

            if (!CurrentUser.HasAccessToArea(request.AreaId))
                throw new UnauthorizedAccessException("Доступ к области запрещен");

            if (request.FolderId.HasValue)
            {
                var folder = await folderRepository.GetByIdAsync(request.FolderId.Value, cancellationToken);
                if (folder == null || folder.AreaId != request.AreaId)
                    throw new InvalidOperationException("Папка не найдена или принадлежит другой области");
            }

            if (!await areaRoleService.CanEditTaskAsync(request.AreaId, cancellationToken))
                throw new UnauthorizedAccessException("Нет прав на создание задач");

            var task = request.ToTaskEntity(currentUser.UserId);

            var createdTask = await taskRepository.CreateAsync(task, cancellationToken);

            var eventEntity = request.ToEventEntity(currentUser.UserId);

            var createdEvent = await eventRepository.CreateAsync(eventEntity, cancellationToken);

            await entityEventLogger.LogAsync(EntityType.TASK, createdTask.Id, EventType.CREATE, createdTask.Title, null, cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            return createdTask.ToTaskWithEventResponse(createdEvent);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            logger.LogError(ex, "Ошибка создания задачи с событием");
            throw;
        }
    }

    /// <summary>
    /// Получить сводку задач по папке
    /// </summary>
    public async Task<IEnumerable<TaskSummaryResponse>> GetTaskSummaryByFolderAsync(Guid folderId, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var folder = await folderRepository.GetByIdAsync(folderId, cancellationToken);
            if (folder == null || !CurrentUser.HasAccessToArea(folder.AreaId))
                throw new UnauthorizedAccessException("Доступ к папке запрещен");

            var tasks = await taskRepository.GetByFolderIdAsync(folderId, cancellationToken);
            var userIds = tasks.Select(t => t.OwnerUserId).Distinct().ToHashSet();
            var users = await userRepository.FindAsync(u => userIds.Contains(u.Id), cancellationToken);
            var userNames = users.ToDictionary(u => u.Id, u => u.Name);

            return tasks.Select(t => t.ToTaskSummaryResponse(userNames.GetValueOrDefault(t.OwnerUserId, "")));
        }, nameof(GetTaskSummaryByFolderAsync), new { folderId });
    }

    /// <summary>
    /// Получить сводку задач в корне области
    /// </summary>
    public async Task<IEnumerable<TaskSummaryResponse>> GetTaskSummaryByAreaRootAsync(Guid areaId, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            if (!CurrentUser.HasAccessToArea(areaId))
                throw new UnauthorizedAccessException("Доступ к области запрещен");

            var tasks = await taskRepository.GetByAreaIdRootAsync(areaId, cancellationToken);
            var userIds = tasks.Select(t => t.OwnerUserId).Distinct().ToHashSet();
            var users = await userRepository.FindAsync(u => userIds.Contains(u.Id), cancellationToken);
            var userNames = users.ToDictionary(u => u.Id, u => u.Name);

            return tasks.Select(t => t.ToTaskSummaryResponse(userNames.GetValueOrDefault(t.OwnerUserId, "")));
        }, nameof(GetTaskSummaryByAreaRootAsync), new { areaId });
    }

    /// <summary>
    /// Получить недельную активность задач (агрегация событий типа ACTIVITY по дням)
    /// </summary>
    /// <param name="request">Параметры запроса недельной активности (год, номер недели)</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Список недельной активности по задачам в статусе In Progress</returns>
    public async Task<IEnumerable<TaskWeeklyActivityResponse>> GetWeeklyActivityAsync(TaskWeeklyActivityRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var weekStart = ISOWeek.ToDateTime(request.Year, request.WeekNumber, DayOfWeek.Monday);
            var weekStartOffset = new DateTimeOffset(weekStart, TimeSpan.Zero);
            var weekEndOffset = weekStartOffset.AddDays(7);

            var inProgressTasks = await taskRepository.FindAsync(
                t => t.Status == TaskStatus.InProgress,
                cancellationToken);

            var tasksWithAccess = inProgressTasks.Where(t => CurrentUser.HasAccessToArea(t.AreaId)).ToList();

            if (tasksWithAccess.Count == 0)
                return new List<TaskWeeklyActivityResponse>();

            var taskIds = tasksWithAccess.Select(t => t.Id).ToHashSet();
            var taskNames = tasksWithAccess.ToDictionary(t => t.Id, t => t.Title);

            var activityQuery = context.EventToTasks
                .AsNoTracking()
                .Where(et => taskIds.Contains(et.TaskId) && et.IsActive)
                .Join(context.Events.Where(e => e.EventType == EventType.ACTIVITY && e.IsActive),
                    et => et.EventId,
                    e => e.Id,
                    (et, e) => new { et.TaskId, EventDate = e.EventDate });

            var activities = await activityQuery.ToListAsync(cancellationToken);

            var weekDates = Enumerable.Range(0, 7)
                .Select(i => weekStartOffset.AddDays(i).ToString("yyyy-MM-dd"))
                .ToList();

            var result = new List<TaskWeeklyActivityResponse>();
            foreach (var task in tasksWithAccess)
            {
                var taskActivities = activities.Where(a => a.TaskId == task.Id).ToList();
                var byDate = taskActivities
                    .GroupBy(a => a.EventDate.UtcDateTime.ToString("yyyy-MM-dd"))
                    .ToDictionary(g => g.Key, g => g.Count());

                var carryWeeks = taskActivities.Count(a => a.EventDate < weekStartOffset);
                var hasFutureActivities = taskActivities.Any(a => a.EventDate >= weekEndOffset);

                result.Add(new TaskWeeklyActivityResponse
                {
                    TaskId = task.Id,
                    TaskName = taskNames.GetValueOrDefault(task.Id, ""),
                    CarryWeeks = carryWeeks > 0 ? 1 : 0,
                    HasFutureActivities = hasFutureActivities,
                    Days = weekDates.Select(d => new TaskDayActivityResponse
                    {
                        Date = d,
                        Count = byDate.GetValueOrDefault(d, 0)
                    }).ToList()
                });
            }

            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка получения недельной активности");
            throw;
        }
    }

    /// <summary>
    /// Получить задачи с активностями по гибкому фильтру (диапазон дат, статусы, пагинация)
    /// </summary>
    /// <param name="request">Параметры фильтра</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Задачи с активностями по дням и метаданные пагинации</returns>
    public async Task<TaskWithActivitiesPagedResponse> GetTasksWithActivitiesAsync(TaskWithActivitiesFilterRequest request, CancellationToken cancellationToken)
    {
        try
        {
            if (!DateTimeOffset.TryParse(request.DateFrom + "T00:00:00Z", null, DateTimeStyles.AssumeUniversal, out var dateFrom))
                throw new ArgumentException("Некорректная дата начала диапазона");
            if (!DateTimeOffset.TryParse(request.DateTo + "T23:59:59.999Z", null, DateTimeStyles.AssumeUniversal, out var dateTo))
                throw new ArgumentException("Некорректная дата конца диапазона");
            if (dateTo < dateFrom)
                throw new ArgumentException("Дата конца не может быть раньше даты начала");

            var rangeStart = new DateTimeOffset(dateFrom.Year, dateFrom.Month, dateFrom.Day, 0, 0, 0, TimeSpan.Zero);
            var rangeEnd = new DateTimeOffset(dateTo.Year, dateTo.Month, dateTo.Day, 23, 59, 59, TimeSpan.Zero);

            var candidateTaskIds = new HashSet<Guid>();

            // По статусам (если заданы)
            if (request.Statuses is { Length: > 0 } statuses)
            {
                var statusSet = statuses.ToHashSet();
                var tasksByStatus = await taskRepository.FindAsync(t => statusSet.Contains((int)t.Status), cancellationToken);
                foreach (var t in tasksByStatus)
                    candidateTaskIds.Add(t.Id);
            }

            // Задачи с активностями в диапазоне
            if (request.IncludeTasksWithActivitiesInRange)
            {
                var taskIdsWithActivities = await context.EventToTasks
                    .AsNoTracking()
                    .Where(et => et.IsActive)
                    .Join(context.Events.Where(e => e.EventType == EventType.ACTIVITY && e.IsActive &&
                        e.EventDate >= rangeStart && e.EventDate <= rangeEnd),
                        et => et.EventId,
                        e => e.Id,
                        (et, _) => et.TaskId)
                    .Distinct()
                    .ToListAsync(cancellationToken);
                foreach (var id in taskIdsWithActivities)
                    candidateTaskIds.Add(id);
            }

            if (candidateTaskIds.Count == 0)
                return new TaskWithActivitiesPagedResponse { Items = [], TotalCount = 0, Page = request.Page, Limit = request.Limit };

            var allCandidateTasks = await taskRepository.FindAsync(t => candidateTaskIds.Contains(t.Id), cancellationToken);

            var tasksWithAccess = allCandidateTasks.Where(t => CurrentUser.HasAccessToArea(t.AreaId)).ToList();

            if (tasksWithAccess.Count == 0)
                return new TaskWithActivitiesPagedResponse { Items = [], TotalCount = 0, Page = request.Page, Limit = request.Limit };

            var taskIds = tasksWithAccess.Select(t => t.Id).ToHashSet();
            var taskNames = tasksWithAccess.ToDictionary(t => t.Id, t => t.Title);

            var activityQuery = context.EventToTasks
                .AsNoTracking()
                .Where(et => taskIds.Contains(et.TaskId) && et.IsActive)
                .Join(context.Events.Where(e => e.EventType == EventType.ACTIVITY && e.IsActive),
                    et => et.EventId,
                    e => e.Id,
                    (et, e) => new { et.TaskId, EventDate = e.EventDate });

            var activities = await activityQuery.ToListAsync(cancellationToken);

            var rangeDates = new List<string>();
            for (var d = rangeStart; d <= rangeEnd; d = d.AddDays(1))
                rangeDates.Add(d.ToString("yyyy-MM-dd"));

            var result = new List<TaskWithActivitiesResponse>();
            foreach (var task in tasksWithAccess)
            {
                var taskActivities = activities.Where(a => a.TaskId == task.Id).ToList();
                var byDate = taskActivities
                    .GroupBy(a => a.EventDate.UtcDateTime.ToString("yyyy-MM-dd"))
                    .ToDictionary(g => g.Key, g => g.Count());

                var carryWeeks = taskActivities.Count(a => a.EventDate < rangeStart);
                var hasFutureActivities = taskActivities.Any(a => a.EventDate > rangeEnd);

                result.Add(new TaskWithActivitiesResponse
                {
                    TaskId = task.Id,
                    TaskName = taskNames.GetValueOrDefault(task.Id, ""),
                    Status = (int)task.Status,
                    AreaId = task.AreaId,
                    FolderId = task.FolderId,
                    CarryWeeks = carryWeeks > 0 ? 1 : 0,
                    HasFutureActivities = hasFutureActivities,
                    Days = rangeDates.Select(d => new TaskDayActivityResponse
                    {
                        Date = d,
                        Count = byDate.GetValueOrDefault(d, 0)
                    }).ToList()
                });
            }

            var totalCount = result.Count;
            var page = request.Page;
            var limit = request.Limit;

            if (page.HasValue && limit.HasValue && limit.Value > 0)
            {
                var skip = (page.Value - 1) * limit.Value;
                result = result.Skip(skip).Take(limit.Value).ToList();
            }
            else
            {
                page = null;
                limit = null;
            }

            return new TaskWithActivitiesPagedResponse
            {
                Items = result,
                TotalCount = totalCount,
                Page = page,
                Limit = limit
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка получения задач с активностями");
            throw;
        }
    }
}
