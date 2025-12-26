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
                CurrentUser.HasAccessToArea(g.AreaId));

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

            if (!CurrentUser.HasAccessToArea(group.AreaId))
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

            var group = request.ToGroupEntity(CurrentUser.UserId);

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

            if (!CurrentUser.HasAccessToArea(group.AreaId))
            {
                throw new UnauthorizedAccessException("Доступ к данной группе запрещен");
            }

            request.UpdateGroupEntity(group);

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

            if (!CurrentUser.HasAccessToArea(group.AreaId))
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
            if (!CurrentUser.HasAccessToArea(areaId))
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
            if (!CurrentUser.HasAccessToArea(areaId))
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
        using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var area = await areaRepository.GetByIdAsync(request.AreaId, cancellationToken);
            if (area == null)
            {
                throw new InvalidOperationException("Область не найдена");
            }

            if (!CurrentUser.HasAccessToArea(area.Id))
            {
                throw new UnauthorizedAccessException("Доступ к данной области запрещен");
            }

            var group = request.ToGroupEntity(currentUser.UserId);

            var createdGroup = await groupRepository.CreateAsync(group, cancellationToken);

            var task = request.ToDefaultTaskEntity(createdGroup.Id, currentUser.UserId);

            var createdTask = await taskRepository.CreateAsync(task, cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            return createdGroup.ToGroupWithTaskResponse(createdTask);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            logger.LogError(ex, "Ошибка создания группы с задачей по умолчанию");
            throw;
        }
    }
}
