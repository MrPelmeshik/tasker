using System.Globalization;
using Microsoft.EntityFrameworkCore;
using TaskerApi.Constants;
using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Services.Base;
using TaskerApi.Services.Mapping;

using System.Text.Json;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для работы с расписаниями задач
/// </summary>
public class TaskScheduleService(
    ILogger<TaskScheduleService> logger,
    ICurrentUserService currentUser,
    ITaskScheduleRepository scheduleRepository,
    ITaskRepository taskRepository,
    IAreaRepository areaRepository,
    IAreaRoleService areaRoleService,
    IEntityEventLogger entityEventLogger,
    TaskerDbContext context)
    : BaseService(logger, currentUser), ITaskScheduleService
{
    private string FormatSchedule(DateTimeOffset start, DateTimeOffset end)
    {
        return $"{start:g} - {end:g}";
    }

    /// <inheritdoc />
    public async Task<TaskScheduleResponse> CreateAsync(TaskScheduleCreateRequest request, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var task = await taskRepository.GetByIdAsync(request.TaskId, cancellationToken);
            if (task == null)
                throw new InvalidOperationException(ErrorMessages.TaskNotFound);

            EnsureAccessToArea(task.AreaId);

            if (!await areaRoleService.CanEditTaskAsync(task.AreaId, cancellationToken))
                throw new UnauthorizedAccessException(ErrorMessages.NoPermissionEditTask);

            if (request.EndAt <= request.StartAt)
                throw new ArgumentException("Время окончания должно быть позже времени начала");

            var entity = request.ToTaskScheduleEntity(currentUser.UserId);
            var created = await scheduleRepository.CreateAsync(entity, cancellationToken);

            // Log event
            var newVal = FormatSchedule(created.StartAt, created.EndAt);
            var messageJson = JsonSerializer.Serialize(new
            {
                old = (object?)null,
                @new = new { Schedule = newVal }
            });
            await entityEventLogger.LogAsync(Models.Common.EntityType.TASK, task.Id, Models.Common.EventType.UPDATE, task.Title, messageJson, cancellationToken);

            var area = await areaRepository.GetByIdAsync(task.AreaId, cancellationToken);
            return created.ToTaskScheduleResponse(task.Title, task.AreaId, area?.Color, (int)task.Status);
        }, nameof(CreateAsync), request);
    }

    /// <inheritdoc />
    public async Task<TaskScheduleResponse> UpdateAsync(Guid id, TaskScheduleUpdateRequest request, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var schedule = await scheduleRepository.GetByIdAsync(id, cancellationToken);
            if (schedule == null)
                throw new InvalidOperationException("Расписание не найдено");

            var task = await taskRepository.GetByIdAsync(schedule.TaskId, cancellationToken);
            if (task == null)
                throw new InvalidOperationException(ErrorMessages.TaskNotFound);

            EnsureAccessToArea(task.AreaId);

            if (!await areaRoleService.CanEditTaskAsync(task.AreaId, cancellationToken))
                throw new UnauthorizedAccessException(ErrorMessages.NoPermissionEditTask);

            if (request.EndAt <= request.StartAt)
                throw new ArgumentException("Время окончания должно быть позже времени начала");

            var oldVal = FormatSchedule(schedule.StartAt, schedule.EndAt);

            schedule.StartAt = request.StartAt;
            schedule.EndAt = request.EndAt;
            schedule.UpdatedAt = DateTimeOffset.UtcNow;

            var updated = await scheduleRepository.UpdateAsync(schedule, cancellationToken);

            // Log event
            var newVal = FormatSchedule(updated.StartAt, updated.EndAt);
            if (oldVal != newVal)
            {
                var messageJson = JsonSerializer.Serialize(new
                {
                    old = new { Schedule = oldVal },
                    @new = new { Schedule = newVal }
                });
                await entityEventLogger.LogAsync(Models.Common.EntityType.TASK, task.Id, Models.Common.EventType.UPDATE, task.Title, messageJson, cancellationToken);
            }

            var area = await areaRepository.GetByIdAsync(task.AreaId, cancellationToken);
            return updated.ToTaskScheduleResponse(task.Title, task.AreaId, area?.Color, (int)task.Status);
        }, nameof(UpdateAsync), new { id, request });
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        await ExecuteWithErrorHandling(async () =>
        {
            var schedule = await scheduleRepository.GetByIdAsync(id, cancellationToken);
            if (schedule == null)
                throw new InvalidOperationException("Расписание не найдено");

            var task = await taskRepository.GetByIdAsync(schedule.TaskId, cancellationToken);
            if (task == null)
                throw new InvalidOperationException(ErrorMessages.TaskNotFound);

            EnsureAccessToArea(task.AreaId);

            if (!await areaRoleService.CanEditTaskAsync(task.AreaId, cancellationToken))
                throw new UnauthorizedAccessException(ErrorMessages.NoPermissionEditTask);

            await scheduleRepository.DeleteAsync(id, cancellationToken);

            // Log event
            var oldVal = FormatSchedule(schedule.StartAt, schedule.EndAt);
            var messageJson = JsonSerializer.Serialize(new
            {
                old = new { Schedule = oldVal },
                @new = (object?)null
            });
            await entityEventLogger.LogAsync(Models.Common.EntityType.TASK, task.Id, Models.Common.EventType.UPDATE, task.Title, messageJson, cancellationToken);

        }, nameof(DeleteAsync), new { id });
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<TaskScheduleResponse>> GetByTaskIdAsync(Guid taskId, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var task = await taskRepository.GetByIdAsync(taskId, cancellationToken);
            if (task == null)
                throw new InvalidOperationException(ErrorMessages.TaskNotFound);

            EnsureAccessToArea(task.AreaId);

            var schedules = await scheduleRepository.GetByTaskIdAsync(taskId, cancellationToken);
            var area = await areaRepository.GetByIdAsync(task.AreaId, cancellationToken);

            return (IReadOnlyList<TaskScheduleResponse>)schedules
                .Select(s => s.ToTaskScheduleResponse(task.Title, task.AreaId, area?.Color, (int)task.Status))
                .ToList();
        }, nameof(GetByTaskIdAsync), new { taskId });
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<TaskScheduleResponse>> GetByWeekAsync(string weekStartIso, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            if (!DateTimeOffset.TryParse(weekStartIso, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var weekStart))
                throw new ArgumentException("Некорректный формат даты начала недели");

            var from = new DateTimeOffset(weekStart.Year, weekStart.Month, weekStart.Day, 0, 0, 0, TimeSpan.Zero);
            var to = from.AddDays(7);

            var schedules = await scheduleRepository.GetByDateRangeAsync(from, to, cancellationToken);

            // Фильтр по доступу пользователя
            var accessibleSchedules = schedules
                .Where(s => s.Task != null && CurrentUser.HasAccessToArea(s.Task.AreaId))
                .ToList();

            // Собираем area info для ответа
            var areaIds = accessibleSchedules
                .Where(s => s.Task != null)
                .Select(s => s.Task!.AreaId)
                .Distinct()
                .ToHashSet();

            var areas = await areaRepository.FindAsync(a => areaIds.Contains(a.Id), cancellationToken);
            var areaMap = areas.ToDictionary(a => a.Id, a => (a.Title, a.Color));

            return (IReadOnlyList<TaskScheduleResponse>)accessibleSchedules
                .Select(s =>
                {
                    var task = s.Task!;
                    var areaInfo = areaMap.GetValueOrDefault(task.AreaId);
                    return s.ToTaskScheduleResponse(task.Title, task.AreaId, areaInfo.Color, (int)task.Status);
                })
                .ToList();
        }, nameof(GetByWeekAsync), new { weekStartIso });
    }
}
