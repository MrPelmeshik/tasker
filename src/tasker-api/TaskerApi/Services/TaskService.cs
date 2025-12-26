using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
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
            
            var accessibleTasks = new List<TaskEntity>();
            foreach (var task in tasks)
            {
                var group = await groupRepository.GetByIdAsync(task.GroupId, cancellationToken);
                if (group != null && CurrentUser.HasAccessToArea(group.AreaId))
                {
                    accessibleTasks.Add(task);
                }
            }

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

            return task.ToTaskResponse();
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

            if (!CurrentUser.HasAccessToArea(group.AreaId))
            {
                throw new UnauthorizedAccessException("Доступ к данной группе запрещен");
            }

            var task = request.ToTaskEntity(currentUser.UserId);

            var createdTask = await taskRepository.CreateAsync(task, cancellationToken);

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
            if (group == null || !CurrentUser.HasAccessToArea(group.AreaId))
            {
                throw new UnauthorizedAccessException("Доступ к данной задаче запрещен");
            }

            request.UpdateTaskEntity(task);

            await taskRepository.UpdateAsync(task, cancellationToken);

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
            if (group == null || !CurrentUser.HasAccessToArea(group.AreaId))
            {
                throw new UnauthorizedAccessException("Доступ к данной задаче запрещен");
            }

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

            if (!CurrentUser.HasAccessToArea(group.AreaId))
            {
                throw new UnauthorizedAccessException("Доступ к данной группе запрещен");
            }

            var task = request.ToTaskEntity(currentUser.UserId);

            var createdTask = await taskRepository.CreateAsync(task, cancellationToken);

            var eventEntity = request.ToEventEntity(currentUser.UserId);

            var createdEvent = await eventRepository.CreateAsync(eventEntity, cancellationToken);

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

            return tasks.Select(t => t.ToTaskSummaryResponse());
        }, nameof(GetTaskSummaryByGroupAsync), new { groupId });
    }

    /// <summary>
    /// Получить недельную активность
    /// </summary>
    /// <param name="request">Параметры запроса недельной активности</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Список недельной активности</returns>
    public async Task<IEnumerable<TaskWeeklyActivityResponse>> GetWeeklyActivityAsync(TaskWeeklyActivityRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return new List<TaskWeeklyActivityResponse>();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка получения недельной активности");
            throw;
        }
    }
    }
