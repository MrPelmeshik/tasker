using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
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
    IGroupRepository groupRepository,
    TaskerDbContext context)
    : ISubtaskService
{
    private readonly IGroupRepository groupRepository = groupRepository;
    /// <summary>
    /// Получить все подзадачи
    /// </summary>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Список всех доступных подзадач</returns>
    public async Task<IEnumerable<SubtaskResponse>> GetAsync(CancellationToken cancellationToken)
    {
        try
        {
            var subtasks = await subtaskRepository.GetAllAsync(cancellationToken);
            
            var accessibleSubtasks = new List<SubtaskEntity>();
            foreach (var subtask in subtasks)
            {
                var task = await taskRepository.GetByIdAsync(subtask.TaskId, cancellationToken);
                if (task != null)
                {
                    var group = await groupRepository.GetByIdAsync(task.GroupId, cancellationToken);
                    if (group != null && currentUser.AccessibleAreas.Contains(group.AreaId))
                    {
                        accessibleSubtasks.Add(subtask);
                    }
                }
            }

            return accessibleSubtasks.Select(s => s.ToSubtaskResponse());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка получения подзадач");
            throw;
        }
    }

    /// <summary>
    /// Получить подзадачу по идентификатору
    /// </summary>
    /// <param name="id">Идентификатор подзадачи</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Подзадача или null, если не найдена</returns>
    public async Task<SubtaskResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var subtask = await subtaskRepository.GetByIdAsync(id, cancellationToken);
            if (subtask == null)
            {
                return null;
            }

            var task = await taskRepository.GetByIdAsync(subtask.TaskId, cancellationToken);
            if (task == null)
            {
                throw new InvalidOperationException("Задача не найдена");
            }
            var group = await groupRepository.GetByIdAsync(task.GroupId, cancellationToken);
            if (group == null || !currentUser.AccessibleAreas.Contains(group.AreaId))
            {
                return null;
            }

            return subtask.ToSubtaskResponse();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка получения подзадачи по идентификатору {SubtaskId}", id);
            throw;
        }
    }

    /// <summary>
    /// Создать новую подзадачу
    /// </summary>
    /// <param name="request">Данные для создания подзадачи</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Созданная подзадача</returns>
    public async Task<SubtaskResponse> CreateAsync(SubtaskCreateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var task = await taskRepository.GetByIdAsync(request.TaskId, cancellationToken);
            if (task == null)
            {
                throw new InvalidOperationException("Задача не найдена");
            }

            var group = await groupRepository.GetByIdAsync(task.GroupId, cancellationToken);
            if (group == null || !currentUser.AccessibleAreas.Contains(group.AreaId))
            {
                throw new UnauthorizedAccessException("Доступ к данной задаче запрещен");
            }

            var subtask = request.ToSubtaskEntity(currentUser.UserId);

            var createdSubtask = await subtaskRepository.CreateAsync(subtask, cancellationToken);

            return createdSubtask.ToSubtaskResponse();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка создания подзадачи");
            throw;
        }
    }

    /// <summary>
    /// Обновить подзадачу
    /// </summary>
    /// <param name="id">Идентификатор подзадачи</param>
    /// <param name="request">Данные для обновления</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Обновленная подзадача</returns>
    public async Task<SubtaskResponse> UpdateAsync(Guid id, SubtaskUpdateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var subtask = await subtaskRepository.GetByIdAsync(id, cancellationToken);
            if (subtask == null)
            {
                throw new InvalidOperationException("Подзадача не найдена");
            }

            var task = await taskRepository.GetByIdAsync(subtask.TaskId, cancellationToken);
            if (task == null)
            {
                throw new InvalidOperationException("Задача не найдена");
            }
            var group = await groupRepository.GetByIdAsync(task.GroupId, cancellationToken);
            if (group == null || !currentUser.AccessibleAreas.Contains(group.AreaId))
            {
                throw new UnauthorizedAccessException("Доступ к данной подзадаче запрещен");
            }

            request.UpdateSubtaskEntity(subtask);

            await subtaskRepository.UpdateAsync(subtask, cancellationToken);

            return subtask.ToSubtaskResponse();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка обновления подзадачи {SubtaskId}", id);
            throw;
        }
    }

    /// <summary>
    /// Удалить подзадачу
    /// </summary>
    /// <param name="id">Идентификатор подзадачи</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var subtask = await subtaskRepository.GetByIdAsync(id, cancellationToken);
            if (subtask == null)
            {
                throw new InvalidOperationException("Подзадача не найдена");
            }

            var task = await taskRepository.GetByIdAsync(subtask.TaskId, cancellationToken);
            if (task == null)
            {
                throw new InvalidOperationException("Задача не найдена");
            }
            var group = await groupRepository.GetByIdAsync(task.GroupId, cancellationToken);
            if (group == null || !currentUser.AccessibleAreas.Contains(group.AreaId))
            {
                throw new UnauthorizedAccessException("Доступ к данной подзадаче запрещен");
            }

            await subtaskRepository.DeleteAsync(id, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка удаления подзадачи {SubtaskId}", id);
            throw;
        }
    }

    /// <summary>
    /// Получить подзадачи по идентификатору задачи
    /// </summary>
    /// <param name="taskId">Идентификатор задачи</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Список подзадач</returns>
    public async Task<IEnumerable<SubtaskResponse>> GetByTaskIdAsync(Guid taskId, CancellationToken cancellationToken)
    {
        try
        {
            var task = await taskRepository.GetByIdAsync(taskId, cancellationToken);
            if (task == null)
            {
                throw new InvalidOperationException("Задача не найдена");
            }

            var group = await groupRepository.GetByIdAsync(task.GroupId, cancellationToken);
            if (group == null || !currentUser.AccessibleAreas.Contains(group.AreaId))
            {
                throw new UnauthorizedAccessException("Доступ к данной задаче запрещен");
            }

            var subtasks = await subtaskRepository.GetByTaskIdAsync(taskId, cancellationToken);

            return subtasks.Select(s => s.ToSubtaskResponse());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка получения подзадач по идентификатору задачи {TaskId}", taskId);
            throw;
        }
    }
}