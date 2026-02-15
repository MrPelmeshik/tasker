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
using TaskerApi.Constants;
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
    IRealtimeNotifier realtimeNotifier,
    TaskerDbContext context,
    Microsoft.Extensions.Options.IOptions<TasksSettings> tasksOptions)
    : BaseService(logger, currentUser), ITaskService
{
    private static int EffectiveMaxPageSize(int configured) => configured > 0 ? configured : 500;
    private int MaxTasksWithActivitiesPageSize => EffectiveMaxPageSize(tasksOptions.Value.MaxActivitiesPageSize);

    private const string DateFormatYmd = "yyyy-MM-dd";

    public async Task<IEnumerable<TaskResponse>> GetAsync(CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var tasks = await taskRepository.GetAllAsync(cancellationToken);
            var accessibleTasks = tasks.Where(t => CurrentUser.HasAccessToArea(t.AreaId)).ToList();
            return accessibleTasks.Select(t => t.ToTaskResponse());
        }, nameof(GetAsync));
    }

    public async Task<TaskResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var task = await taskRepository.GetByIdAsync(id, cancellationToken);
            if (task == null || !CurrentUser.HasAccessToArea(task.AreaId))
                return null;
            var user = await userRepository.GetByIdAsync(task.OwnerUserId, cancellationToken);
            return task.ToTaskResponse(user?.Name ?? "");
        }, nameof(GetByIdAsync), new { id });
    }

    public async Task<TaskResponse> CreateAsync(TaskCreateRequest request, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var area = await areaRepository.GetByIdAsync(request.AreaId, cancellationToken);
            if (area == null)
                throw new InvalidOperationException(ErrorMessages.AreaNotFound);
            if (!CurrentUser.HasAccessToArea(request.AreaId))
                throw new UnauthorizedAccessException(ErrorMessages.AccessAreaDenied);
            if (request.FolderId.HasValue)
            {
                var folder = await folderRepository.GetByIdAsync(request.FolderId.Value, cancellationToken);
                if (folder == null || folder.AreaId != request.AreaId)
                    throw new InvalidOperationException(ErrorMessages.ParentFolderNotFound);
            }
            if (!await areaRoleService.CanEditTaskAsync(request.AreaId, cancellationToken))
                throw new UnauthorizedAccessException(ErrorMessages.NoPermissionCreateTasksInArea);

            var task = request.ToTaskEntity(currentUser.UserId);
            var createdTask = await taskRepository.CreateAsync(task, cancellationToken);
            await entityEventLogger.LogAsync(EntityType.TASK, createdTask.Id, EventType.CREATE, createdTask.Title, null, cancellationToken);
            await realtimeNotifier.NotifyEntityChangedAsync(EntityType.TASK, createdTask.Id, createdTask.AreaId, createdTask.FolderId, RealtimeEventType.Create, cancellationToken);
            return createdTask.ToTaskResponse();
        }, nameof(CreateAsync), request);
    }

    public async Task<TaskResponse> UpdateAsync(Guid id, TaskUpdateRequest request, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var task = await taskRepository.GetByIdAsync(id, cancellationToken);
            if (task == null)
                throw new InvalidOperationException(ErrorMessages.TaskNotFound);
            if (!CurrentUser.HasAccessToArea(task.AreaId))
                throw new UnauthorizedAccessException(ErrorMessages.AccessTaskDenied);
            if (!await areaRoleService.CanEditTaskAsync(task.AreaId, cancellationToken))
                throw new UnauthorizedAccessException(ErrorMessages.NoPermissionEditTask);

            if (request.AreaId != task.AreaId || request.FolderId != task.FolderId)
            {
                if (!CurrentUser.HasAccessToArea(request.AreaId))
                    throw new UnauthorizedAccessException(ErrorMessages.AccessTargetAreaDenied);
                var area = await areaRepository.GetByIdAsync(request.AreaId, cancellationToken);
                if (area == null)
                    throw new InvalidOperationException(ErrorMessages.TargetAreaNotFound);
                if (request.FolderId.HasValue)
                {
                    var folder = await folderRepository.GetByIdAsync(request.FolderId.Value, cancellationToken);
                    if (folder == null || folder.AreaId != request.AreaId)
                        throw new InvalidOperationException(ErrorMessages.TargetFolderNotFound);
                }
                if (!await areaRoleService.CanEditTaskAsync(request.AreaId, cancellationToken))
                    throw new UnauthorizedAccessException(ErrorMessages.NoPermissionEditTargetArea);
            }

            var oldSnapshot = EventMessageHelper.ShallowClone(task);
            request.UpdateTaskEntity(task);
            await taskRepository.UpdateAsync(task, cancellationToken);
            var messageJson = EventMessageHelper.BuildUpdateMessageJson(oldSnapshot, task);
            await entityEventLogger.LogAsync(EntityType.TASK, id, EventType.UPDATE, task.Title, messageJson, cancellationToken);
            await realtimeNotifier.NotifyEntityChangedAsync(EntityType.TASK, id, task.AreaId, task.FolderId, RealtimeEventType.Update, cancellationToken);
            return task.ToTaskResponse();
        }, nameof(UpdateAsync), new { id, request });
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        await ExecuteWithErrorHandling(async () =>
        {
            var task = await taskRepository.GetByIdAsync(id, cancellationToken);
            if (task == null)
                throw new InvalidOperationException(ErrorMessages.TaskNotFound);
            if (!CurrentUser.HasAccessToArea(task.AreaId))
                throw new UnauthorizedAccessException(ErrorMessages.AccessTaskDenied);
            if (!await areaRoleService.CanCreateOrDeleteStructureAsync(task.AreaId, cancellationToken))
                throw new UnauthorizedAccessException(ErrorMessages.OnlyOwnerCanDeleteTasks);

            await entityEventLogger.LogAsync(EntityType.TASK, id, EventType.DELETE, task.Title, null, cancellationToken);
            await realtimeNotifier.NotifyEntityChangedAsync(EntityType.TASK, id, task.AreaId, task.FolderId, RealtimeEventType.Delete, cancellationToken);
            await taskRepository.DeleteAsync(id, cancellationToken);
        }, nameof(DeleteAsync), new { id });
    }

    public async Task<TaskWithEventResponse> CreateWithEventAsync(CreateTaskWithEventRequest request, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                var area = await areaRepository.GetByIdAsync(request.AreaId, cancellationToken);
                if (area == null)
                    throw new InvalidOperationException(ErrorMessages.AreaNotFound);
                if (!CurrentUser.HasAccessToArea(request.AreaId))
                    throw new UnauthorizedAccessException(ErrorMessages.AccessAreaDenied);
                if (request.FolderId.HasValue)
                {
                    var folder = await folderRepository.GetByIdAsync(request.FolderId.Value, cancellationToken);
                    if (folder == null || folder.AreaId != request.AreaId)
                        throw new InvalidOperationException(ErrorMessages.ParentFolderNotFound);
                }
                if (!await areaRoleService.CanEditTaskAsync(request.AreaId, cancellationToken))
                    throw new UnauthorizedAccessException(ErrorMessages.NoPermissionCreateTasks);

                var task = request.ToTaskEntity(currentUser.UserId);
                var createdTask = await taskRepository.CreateAsync(task, cancellationToken);
                var eventEntity = request.ToEventEntity(currentUser.UserId);
                var createdEvent = await eventRepository.CreateAsync(eventEntity, cancellationToken);
                await entityEventLogger.LogAsync(EntityType.TASK, createdTask.Id, EventType.CREATE, createdTask.Title, null, cancellationToken);
                await realtimeNotifier.NotifyEntityChangedAsync(EntityType.TASK, createdTask.Id, createdTask.AreaId, createdTask.FolderId, RealtimeEventType.Create, cancellationToken);
                await transaction.CommitAsync(cancellationToken);
                return createdTask.ToTaskWithEventResponse(createdEvent);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }, nameof(CreateWithEventAsync), request);
    }

    public async Task<IEnumerable<TaskSummaryResponse>> GetTaskSummaryByFolderAsync(Guid folderId, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var folder = await folderRepository.GetByIdAsync(folderId, cancellationToken);
            if (folder == null || !CurrentUser.HasAccessToArea(folder.AreaId))
                throw new UnauthorizedAccessException(ErrorMessages.AccessFolderDenied);

            var tasks = await taskRepository.GetByFolderIdAsync(folderId, cancellationToken);
            var userIds = tasks.Select(t => t.OwnerUserId).Distinct().ToHashSet();
            var users = await userRepository.FindAsync(u => userIds.Contains(u.Id), cancellationToken);
            var userNames = users.ToDictionary(u => u.Id, u => u.Name);

            return tasks.Select(t => t.ToTaskSummaryResponse(userNames.GetValueOrDefault(t.OwnerUserId, "")));
        }, nameof(GetTaskSummaryByFolderAsync), new { folderId });
    }

    public async Task<IEnumerable<TaskSummaryResponse>> GetTaskSummaryByAreaRootAsync(Guid areaId, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            if (!CurrentUser.HasAccessToArea(areaId))
                throw new UnauthorizedAccessException(ErrorMessages.AccessAreaDenied);

            var tasks = await taskRepository.GetByAreaIdRootAsync(areaId, cancellationToken);
            var userIds = tasks.Select(t => t.OwnerUserId).Distinct().ToHashSet();
            var users = await userRepository.FindAsync(u => userIds.Contains(u.Id), cancellationToken);
            var userNames = users.ToDictionary(u => u.Id, u => u.Name);

            return tasks.Select(t => t.ToTaskSummaryResponse(userNames.GetValueOrDefault(t.OwnerUserId, "")));
        }, nameof(GetTaskSummaryByAreaRootAsync), new { areaId });
    }

    public async Task<IEnumerable<TaskWeeklyActivityResponse>> GetWeeklyActivityAsync(TaskWeeklyActivityRequest request, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var weekStart = ISOWeek.ToDateTime(request.Year, request.WeekNumber, DayOfWeek.Monday);
            var weekStartOffset = new DateTimeOffset(weekStart, TimeSpan.Zero);
            var weekEndOffset = weekStartOffset.AddDays(7);

            var inProgressTasks = await taskRepository.FindAsync(t => t.Status == TaskStatus.InProgress, cancellationToken);
            var tasksWithAccess = inProgressTasks.Where(t => CurrentUser.HasAccessToArea(t.AreaId)).ToList();
            if (tasksWithAccess.Count == 0)
                return new List<TaskWeeklyActivityResponse>();

            var taskIds = tasksWithAccess.Select(t => t.Id).ToHashSet();
            var taskNames = tasksWithAccess.ToDictionary(t => t.Id, t => t.Title);
            var activities = await GetTaskActivityEventsAsync(taskIds, cancellationToken);

            var weekDates = Enumerable.Range(0, 7).Select(i => weekStartOffset.AddDays(i).ToString(DateFormatYmd)).ToList();
            var result = new List<TaskWeeklyActivityResponse>();
            foreach (var task in tasksWithAccess)
            {
                var taskActivities = activities.Where(a => a.TaskId == task.Id).ToList();
                var byDate = taskActivities.GroupBy(a => a.EventDate.UtcDateTime.ToString(DateFormatYmd)).ToDictionary(g => g.Key, g => g.Count());
                var carryWeeks = taskActivities.Count(a => a.EventDate < weekStartOffset);
                var hasFutureActivities = taskActivities.Any(a => a.EventDate >= weekEndOffset);
                result.Add(new TaskWeeklyActivityResponse
                {
                    TaskId = task.Id,
                    TaskName = taskNames.GetValueOrDefault(task.Id, ""),
                    CarryWeeks = carryWeeks > 0 ? 1 : 0,
                    HasFutureActivities = hasFutureActivities,
                    Days = weekDates.Select(d => new TaskDayActivityResponse { Date = d, Count = byDate.GetValueOrDefault(d, 0) }).ToList()
                });
            }
            return result;
        }, nameof(GetWeeklyActivityAsync), request);
    }

    public async Task<TaskWithActivitiesPagedResponse> GetTasksWithActivitiesAsync(TaskWithActivitiesFilterRequest request, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            if (!DateTimeOffset.TryParse(request.DateFrom + "T00:00:00Z", null, DateTimeStyles.AssumeUniversal, out var dateFrom))
                throw new ArgumentException(ErrorMessages.InvalidDateFrom);
            if (!DateTimeOffset.TryParse(request.DateTo + "T23:59:59.999Z", null, DateTimeStyles.AssumeUniversal, out var dateTo))
                throw new ArgumentException(ErrorMessages.InvalidDateTo);
            if (dateTo < dateFrom)
                throw new ArgumentException(ErrorMessages.DateToBeforeDateFrom);

            var rangeStart = new DateTimeOffset(dateFrom.Year, dateFrom.Month, dateFrom.Day, 0, 0, 0, TimeSpan.Zero);
            var rangeEnd = new DateTimeOffset(dateTo.Year, dateTo.Month, dateTo.Day, 23, 59, 59, TimeSpan.Zero);

            var candidateTaskIds = new HashSet<Guid>();
            if (request.Statuses is { Length: > 0 } statuses)
            {
                var statusSet = statuses.ToHashSet();
                var tasksByStatus = await taskRepository.FindAsync(t => statusSet.Contains((int)t.Status), cancellationToken);
                foreach (var t in tasksByStatus) candidateTaskIds.Add(t.Id);
            }
            if (request.IncludeTasksWithActivitiesInRange)
            {
                var taskIdsWithActivities = await context.EventToTasks
                    .AsNoTracking()
                    .Where(et => et.IsActive)
                    .Join(context.Events.Where(e => (e.EventType == EventType.ACTIVITY || e.EventType == EventType.NOTE) && e.IsActive && e.EventDate >= rangeStart && e.EventDate <= rangeEnd),
                        et => et.EventId, e => e.Id, (et, _) => et.TaskId)
                    .Distinct()
                    .ToListAsync(cancellationToken);
                foreach (var id in taskIdsWithActivities) candidateTaskIds.Add(id);
            }

            if (candidateTaskIds.Count == 0)
                return new TaskWithActivitiesPagedResponse { Items = [], TotalCount = 0, Page = request.Page, Limit = request.Limit };

            var allCandidateTasks = await taskRepository.FindAsync(t => candidateTaskIds.Contains(t.Id), cancellationToken);
            var tasksWithAccess = allCandidateTasks.Where(t => CurrentUser.HasAccessToArea(t.AreaId)).ToList();
            if (tasksWithAccess.Count == 0)
                return new TaskWithActivitiesPagedResponse { Items = [], TotalCount = 0, Page = request.Page, Limit = request.Limit };

            var taskIds = tasksWithAccess.Select(t => t.Id).ToHashSet();
            var taskNames = tasksWithAccess.ToDictionary(t => t.Id, t => t.Title);
            var areaIds = tasksWithAccess.Select(t => t.AreaId).Distinct().ToHashSet();
            var areas = await areaRepository.FindAsync(a => areaIds.Contains(a.Id), cancellationToken);
            var areaTitles = areas.ToDictionary(a => a.Id, a => a.Title);

            var activities = await GetTaskActivityEventsAsync(taskIds, cancellationToken);

            var rangeDates = new List<string>();
            for (var d = rangeStart; d <= rangeEnd; d = d.AddDays(1))
                rangeDates.Add(d.ToString(DateFormatYmd));

            var result = new List<TaskWithActivitiesResponse>();
            foreach (var task in tasksWithAccess)
            {
                var taskActivities = activities.Where(a => a.TaskId == task.Id).ToList();
                var byDate = taskActivities.GroupBy(a => a.EventDate.UtcDateTime.ToString(DateFormatYmd)).ToDictionary(g => g.Key, g => g.Count());
                var carryWeeks = taskActivities.Count(a => a.EventDate < rangeStart);
                var hasFutureActivities = taskActivities.Any(a => a.EventDate > rangeEnd);
                result.Add(new TaskWithActivitiesResponse
                {
                    TaskId = task.Id,
                    TaskName = taskNames.GetValueOrDefault(task.Id, ""),
                    Status = (int)task.Status,
                    AreaId = task.AreaId,
                    AreaTitle = areaTitles.GetValueOrDefault(task.AreaId, null),
                    FolderId = task.FolderId,
                    CarryWeeks = carryWeeks > 0 ? 1 : 0,
                    HasFutureActivities = hasFutureActivities,
                    Days = rangeDates.Select(d => new TaskDayActivityResponse { Date = d, Count = byDate.GetValueOrDefault(d, 0) }).ToList()
                });
            }

            var totalCount = result.Count;
            var page = request.Page;
            var limit = request.Limit;
            if (page.HasValue && limit.HasValue && limit.Value > 0)
            {
                var effectiveLimit = Math.Min(limit.Value, MaxTasksWithActivitiesPageSize);
                var skip = (page.Value - 1) * effectiveLimit;
                result = result.Skip(skip).Take(effectiveLimit).ToList();
                limit = effectiveLimit;
            }
            else
            {
                page = null;
                limit = null;
            }

            return new TaskWithActivitiesPagedResponse { Items = result, TotalCount = totalCount, Page = page, Limit = limit };
        }, nameof(GetTasksWithActivitiesAsync), request);
    }

    private async Task<List<(Guid TaskId, DateTimeOffset EventDate)>> GetTaskActivityEventsAsync(HashSet<Guid> taskIds, CancellationToken cancellationToken)
    {
        if (taskIds.Count == 0)
            return new List<(Guid, DateTimeOffset)>();
        var query = context.EventToTasks
            .AsNoTracking()
            .Where(et => taskIds.Contains(et.TaskId) && et.IsActive)
            .Join(context.Events.Where(e => (e.EventType == EventType.ACTIVITY || e.EventType == EventType.NOTE) && e.IsActive),
                et => et.EventId, e => e.Id, (et, e) => new { et.TaskId, e.EventDate });
        var list = await query.ToListAsync(cancellationToken);
        return list.Select(x => (x.TaskId, x.EventDate)).ToList();
    }
}
