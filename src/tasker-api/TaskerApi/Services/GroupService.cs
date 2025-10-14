using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Services.Base;
using TaskerApi.Services.Mapping;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для работы с группами с использованием Entity Framework
/// </summary>
public class GroupService(
    ILogger<GroupService> logger,
    ICurrentUserService currentUser,
    IGroupRepository groupRepository,
    IAreaRepository areaRepository,
    ITaskRepository taskRepository,
    TaskerDbContext context)
    : BaseService(logger, currentUser), IGroupService
{
    /// <summary>
    /// Получить все группы
    /// </summary>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Список всех доступных групп</returns>
    public async Task<IEnumerable<GroupResponse>> GetAsync(CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var groups = await groupRepository.GetAllAsync(cancellationToken);
            
            var accessibleGroups = groups.Where(g => 
                CurrentUser.AccessibleAreas.Contains(g.AreaId));

            return accessibleGroups.Select(g => g.ToGroupResponse());
        }, nameof(GetAsync));
    }

    /// <summary>
    /// Получить группу по идентификатору
    /// </summary>
    /// <param name="id">Идентификатор группы</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Группа или null, если не найдена</returns>
    public async Task<GroupResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var group = await groupRepository.GetByIdAsync(id, cancellationToken);
            if (group == null)
            {
                return null;
            }

            if (!CurrentUser.AccessibleAreas.Contains(group.AreaId))
            {
                return null;
            }

            return group.ToGroupResponse();
        }, nameof(GetByIdAsync), new { id });
    }

    /// <summary>
    /// Создать новую группу
    /// </summary>
    /// <param name="request">Данные для создания группы</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Созданная группа</returns>
    public async Task<GroupResponse> CreateAsync(GroupCreateRequest request, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var area = await areaRepository.GetByIdAsync(request.AreaId, cancellationToken);
            if (area == null)
            {
                throw new InvalidOperationException("Область не найдена");
            }

            EnsureAccessToArea(area.Id);

            var group = new GroupEntity
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                AreaId = request.AreaId,
                CreatorUserId = CurrentUser.UserId,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                IsActive = true
            };

            var createdGroup = await groupRepository.CreateAsync(group, cancellationToken);

            return createdGroup.ToGroupResponse();
        }, nameof(CreateAsync), request);
    }

    /// <summary>
    /// Обновить группу
    /// </summary>
    /// <param name="id">Идентификатор группы</param>
    /// <param name="request">Данные для обновления</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Обновленная группа</returns>
    public async Task<GroupResponse> UpdateAsync(Guid id, GroupUpdateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var group = await groupRepository.GetByIdAsync(id, cancellationToken);
            if (group == null)
            {
                throw new InvalidOperationException("Группа не найдена");
            }

            if (!currentUser.AccessibleAreas.Contains(group.AreaId))
            {
                throw new UnauthorizedAccessException("Доступ к данной группе запрещен");
            }

            group.Title = request.Title;
            group.Description = request.Description;
            group.UpdatedAt = DateTime.UtcNow;

            await groupRepository.UpdateAsync(group, cancellationToken);

            return group.ToGroupResponse();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка обновления группы {GroupId}", id);
            throw;
        }
    }

    /// <summary>
    /// Удалить группу
    /// </summary>
    /// <param name="id">Идентификатор группы</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var group = await groupRepository.GetByIdAsync(id, cancellationToken);
            if (group == null)
            {
                throw new InvalidOperationException("Группа не найдена");
            }

            if (!currentUser.AccessibleAreas.Contains(group.AreaId))
            {
                throw new UnauthorizedAccessException("Доступ к данной группе запрещен");
            }

            await groupRepository.DeleteAsync(id, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка удаления группы {GroupId}", id);
            throw;
        }
    }

    /// <summary>
    /// Получить группы по идентификатору области
    /// </summary>
    /// <param name="areaId">Идентификатор области</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Список групп в области</returns>
    public async Task<IEnumerable<GroupResponse>> GetByAreaIdAsync(Guid areaId, CancellationToken cancellationToken)
    {
        try
        {
            if (!currentUser.AccessibleAreas.Contains(areaId))
            {
                throw new UnauthorizedAccessException("Доступ к данной области запрещен");
            }

            var groups = await groupRepository.GetByAreaIdAsync(areaId, cancellationToken);

            return groups.Select(g => g.ToGroupResponse());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка получения групп по идентификатору области {AreaId}", areaId);
            throw;
        }
    }

    /// <summary>
    /// Получить краткие карточки групп по идентификатору области
    /// </summary>
    /// <param name="areaId">Идентификатор области</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Список кратких карточек групп</returns>
    public async Task<IEnumerable<GroupSummaryResponse>> GetGroupShortCardByAreaAsync(Guid areaId, CancellationToken cancellationToken)
    {
        try
        {
            if (!currentUser.AccessibleAreas.Contains(areaId))
            {
                throw new UnauthorizedAccessException("Доступ к данной области запрещен");
            }

            var groups = await groupRepository.GetByAreaIdAsync(areaId, cancellationToken);

            return groups.Select(g => g.ToGroupSummaryResponse());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка получения кратких карточек групп по идентификатору области {AreaId}", areaId);
            throw;
        }
    }

    /// <summary>
    /// Сложная операция - создать группу с задачей по умолчанию (явная транзакция)
    /// </summary>
    /// <param name="request">Данные для создания группы с задачей</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Созданная группа с задачей</returns>
    public async Task<GroupWithTaskResponse> CreateWithDefaultTaskAsync(CreateGroupWithTaskRequest request, CancellationToken cancellationToken)
    {
        using var transaction = await context.Database.BeginTransactionAsync();
        try
        {
            var area = await areaRepository.GetByIdAsync(request.AreaId, cancellationToken);
            if (area == null)
            {
                throw new InvalidOperationException("Область не найдена");
            }

            if (!currentUser.AccessibleAreas.Contains(area.Id))
            {
                throw new UnauthorizedAccessException("Доступ к данной области запрещен");
            }

            var group = new GroupEntity
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                AreaId = request.AreaId,
                CreatorUserId = currentUser.UserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var createdGroup = await groupRepository.CreateAsync(group, cancellationToken);

            var task = new TaskEntity
            {
                Id = Guid.NewGuid(),
                Title = request.TaskTitle,
                Description = request.TaskDescription,
                Status = Models.Common.TaskStatus.Pending,
                GroupId = createdGroup.Id,
                CreatorUserId = currentUser.UserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var createdTask = await taskRepository.CreateAsync(task, cancellationToken);

            await transaction.CommitAsync();

            return new GroupWithTaskResponse
            {
                Group = createdGroup.ToGroupResponse(),
                DefaultTask = createdTask.ToTaskResponse()
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            logger.LogError(ex, "Ошибка создания группы с задачей по умолчанию");
            throw;
        }
    }
}

/// <summary>
/// Запрос для создания группы с задачей по умолчанию
/// </summary>
public class CreateGroupWithTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid AreaId { get; set; }
    public string TaskTitle { get; set; } = string.Empty;
    public string TaskDescription { get; set; } = string.Empty;
}

/// <summary>
/// Ответ с группой и задачей по умолчанию
/// </summary>
public class GroupWithTaskResponse
{
    public GroupResponse Group { get; set; } = null!;
    public TaskResponse DefaultTask { get; set; } = null!;
}