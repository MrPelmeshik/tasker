using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Constants;
using TaskerApi.Services.Base;
using TaskerApi.Services.Mapping;
using TaskStatus = TaskerApi.Models.Common.TaskStatus;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для работы с подзадачами с использованием Entity Framework
/// </summary>
public class SubtaskService(
    ILogger<SubtaskService> logger,
    ICurrentUserService currentUser,
    ISubtaskRepository subtaskRepository,
    ITaskRepository taskRepository,
    TaskerDbContext context)
    : BaseService(logger, currentUser), ISubtaskService
{
    public async Task<IEnumerable<SubtaskResponse>> GetAsync(CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var subtasks = await subtaskRepository.GetAllAsync(cancellationToken);
            var taskIds = subtasks.Select(s => s.TaskId).Distinct().ToHashSet();
            if (taskIds.Count == 0)
                return Enumerable.Empty<SubtaskResponse>();

            var tasks = await taskRepository.FindAsync(t => taskIds.Contains(t.Id), cancellationToken);
            var accessibleTaskIds = tasks.Where(t => CurrentUser.HasAccessToArea(t.AreaId)).Select(t => t.Id).ToHashSet();
            var accessibleSubtasks = subtasks.Where(s => accessibleTaskIds.Contains(s.TaskId)).ToList();
            return accessibleSubtasks.Select(s => s.ToSubtaskResponse());
        }, nameof(GetAsync));
    }

    public async Task<SubtaskResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var subtask = await subtaskRepository.GetByIdAsync(id, cancellationToken);
            if (subtask == null)
                return null;

            var task = await taskRepository.GetByIdAsync(subtask.TaskId, cancellationToken);
            if (task == null)
                throw new InvalidOperationException(ErrorMessages.TaskNotFound);
            if (!CurrentUser.HasAccessToArea(task.AreaId))
                return null;

            return subtask.ToSubtaskResponse();
        }, nameof(GetByIdAsync), new { id });
    }

    public async Task<SubtaskResponse> CreateAsync(SubtaskCreateRequest request, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var task = await taskRepository.GetByIdAsync(request.TaskId, cancellationToken);
            if (task == null)
                throw new InvalidOperationException(ErrorMessages.TaskNotFound);
            if (!CurrentUser.HasAccessToArea(task.AreaId))
                throw new UnauthorizedAccessException(ErrorMessages.AccessTaskDeniedThis);

            var subtask = request.ToSubtaskEntity(CurrentUser.UserId);
            var createdSubtask = await subtaskRepository.CreateAsync(subtask, cancellationToken);
            return createdSubtask.ToSubtaskResponse();
        }, nameof(CreateAsync), request);
    }

    public async Task<SubtaskResponse> UpdateAsync(Guid id, SubtaskUpdateRequest request, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var subtask = await subtaskRepository.GetByIdAsync(id, cancellationToken);
            if (subtask == null)
                throw new InvalidOperationException(ErrorMessages.SubtaskNotFound);

            var task = await taskRepository.GetByIdAsync(subtask.TaskId, cancellationToken);
            if (task == null)
                throw new InvalidOperationException(ErrorMessages.TaskNotFound);
            if (!CurrentUser.HasAccessToArea(task.AreaId))
                throw new UnauthorizedAccessException(ErrorMessages.AccessSubtaskDenied);

            request.UpdateSubtaskEntity(subtask);
            await subtaskRepository.UpdateAsync(subtask, cancellationToken);
            return subtask.ToSubtaskResponse();
        }, nameof(UpdateAsync), new { id, request });
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        await ExecuteWithErrorHandling(async () =>
        {
            var subtask = await subtaskRepository.GetByIdAsync(id, cancellationToken);
            if (subtask == null)
                throw new InvalidOperationException(ErrorMessages.SubtaskNotFound);

            var task = await taskRepository.GetByIdAsync(subtask.TaskId, cancellationToken);
            if (task == null)
                throw new InvalidOperationException(ErrorMessages.TaskNotFound);
            if (!CurrentUser.HasAccessToArea(task.AreaId))
                throw new UnauthorizedAccessException(ErrorMessages.AccessSubtaskDenied);

            await subtaskRepository.DeleteAsync(id, cancellationToken);
        }, nameof(DeleteAsync), new { id });
    }

    public async Task<IEnumerable<SubtaskResponse>> GetByTaskIdAsync(Guid taskId, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var task = await taskRepository.GetByIdAsync(taskId, cancellationToken);
            if (task == null)
                throw new InvalidOperationException(ErrorMessages.TaskNotFound);
            if (!CurrentUser.HasAccessToArea(task.AreaId))
                throw new UnauthorizedAccessException(ErrorMessages.AccessTaskDeniedThis);

            var subtasks = await subtaskRepository.GetByTaskIdAsync(taskId, cancellationToken);
            return subtasks.Select(s => s.ToSubtaskResponse());
        }, nameof(GetByTaskIdAsync), new { taskId });
    }
}