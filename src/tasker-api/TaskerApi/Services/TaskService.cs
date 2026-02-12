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
    IGroupRepository groupRepository,
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

            var groupIds = tasks.Select(t => t.GroupId).Distinct().ToHashSet();
            var groups = await groupRepository.FindAsync(g => groupIds.Contains(g.Id), cancellationToken);
            var groupsByArea = groups.Where(g => CurrentUser.HasAccessToArea(g.AreaId)).Select(g => g.Id).ToHashSet();

            var accessibleTasks = tasks.Where(t => groupsByArea.Contains(t.GroupId)).ToList();

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

            var group = await groupRepository.GetByIdAsync(task.GroupId, cancellationToken);
            if (group == null || !CurrentUser.HasAccessToArea(group.AreaId))
            {
                return null;
            }

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
            var group = await groupRepository.GetByIdAsync(request.GroupId, cancellationToken);
            if (group == null)
            {
                throw new InvalidOperationException("Группа не найдена");
            }

            if (!await areaRoleService.CanCreateOrDeleteStructureAsync(group.AreaId, cancellationToken))
            {
                throw new UnauthorizedAccessException("Только владелец области может создавать задачи");
            }

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

            var group = await groupRepository.GetByIdAsync(task.GroupId, cancellationToken);
            if (group == null)
            {
                throw new InvalidOperationException("Группа не найдена");
            }

            if (!await areaRoleService.CanEditTaskAsync(group.AreaId, cancellationToken))
            {
                throw new UnauthorizedAccessException("Нет прав на редактирование задачи");
            }

            // При переносе в другую группу — проверяем доступ к новой области
            if (request.GroupId != task.GroupId)
            {
                var newGroup = await groupRepository.GetByIdAsync(request.GroupId, cancellationToken);
                if (newGroup == null)
                    throw new InvalidOperationException("Целевая группа не найдена");
                if (!await areaRoleService.CanEditTaskAsync(newGroup.AreaId, cancellationToken))
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

            var group = await groupRepository.GetByIdAsync(task.GroupId, cancellationToken);
            if (group == null)
            {
                throw new InvalidOperationException("Группа не найдена");
            }

            if (!await areaRoleService.CanCreateOrDeleteStructureAsync(group.AreaId, cancellationToken))
            {
                throw new UnauthorizedAccessException("Только владелец области может удалять задачи");
            }

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
            var group = await groupRepository.GetByIdAsync(request.GroupId, cancellationToken);
            if (group == null)
            {
                throw new InvalidOperationException("Группа не найдена");
            }

            if (!await areaRoleService.CanCreateOrDeleteStructureAsync(group.AreaId, cancellationToken))
            {
                throw new UnauthorizedAccessException("Только владелец области может создавать задачи");
            }

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
    /// Получить сводку задач по группе
    /// </summary>
    /// <param name="groupId">Идентификатор группы</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Список сводок задач</returns>
    public async Task<IEnumerable<TaskSummaryResponse>> GetTaskSummaryByGroupAsync(Guid groupId, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            await EnsureAccessToGroupAsync(groupId, groupRepository, cancellationToken);

            var tasks = await taskRepository.GetByGroupIdAsync(groupId, cancellationToken);

            // Пакетная загрузка имён владельцев
            var userIds = tasks.Select(t => t.OwnerUserId).Distinct().ToHashSet();
            var users = await userRepository.FindAsync(u => userIds.Contains(u.Id), cancellationToken);
            var userNames = users.ToDictionary(u => u.Id, u => u.Name);

            return tasks.Select(t => t.ToTaskSummaryResponse(userNames.GetValueOrDefault(t.OwnerUserId, "")));
        }, nameof(GetTaskSummaryByGroupAsync), new { groupId });
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

            var groupIds = inProgressTasks.Select(t => t.GroupId).Distinct().ToHashSet();
            var groups = await groupRepository.FindAsync(g => groupIds.Contains(g.Id), cancellationToken);
            var accessibleGroupIds = groups.Where(g => CurrentUser.HasAccessToArea(g.AreaId)).Select(g => g.Id).ToHashSet();
            var tasksWithAccess = inProgressTasks.Where(t => accessibleGroupIds.Contains(t.GroupId)).ToList();

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
    }
