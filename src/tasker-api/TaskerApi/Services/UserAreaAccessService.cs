using System.Data;
using Dapper;
using TaskerApi.Interfaces.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для управления правами доступа пользователей к областям
/// </summary>
public class UserAreaAccessService(
    ILogger<UserAreaAccessService> logger,
    IUnitOfWorkFactory uowFactory,
    IUserAreaAccessProvider userAreaAccessProvider,
    IGroupProvider groupProvider,
    ITaskProvider taskProvider,
    ISubtaskProvider subtaskProvider)
    : IUserAreaAccessService
{
    public async Task<bool> HasAccessAsync(Guid userId, Guid areaId, CancellationToken cancellationToken = default)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var hasAccess = await userAreaAccessProvider.HasAccessAsync(
                uow.Connection,
                userId,
                areaId,
                cancellationToken,
                uow.Transaction);

            await uow.CommitAsync(cancellationToken);
            return hasAccess;
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            logger.LogError(e, "Ошибка при проверке доступа пользователя {UserId} к области {AreaId}", userId, areaId);
            throw;
        }
    }

    public async Task<IReadOnlyList<Guid>> GetUserAccessibleAreaIdsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var areaIds = await userAreaAccessProvider.GetUserAccessibleAreaIdsAsync(
                uow.Connection,
                userId,
                cancellationToken,
                uow.Transaction);

            await uow.CommitAsync(cancellationToken);
            return areaIds;
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            logger.LogError(e, "Ошибка при получении списка доступных областей для пользователя {UserId}", userId);
            throw;
        }
    }

    public async Task<Guid> GrantAccessAsync(Guid userId, Guid areaId, Guid grantedByUserId, CancellationToken cancellationToken = default)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var accessId = await userAreaAccessProvider.GrantAccessAsync(
                uow.Connection,
                userId,
                areaId,
                grantedByUserId,
                cancellationToken,
                uow.Transaction);

            await uow.CommitAsync(cancellationToken);
            return accessId;
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            logger.LogError(e, "Ошибка при предоставлении доступа пользователю {UserId} к области {AreaId}", userId, areaId);
            throw;
        }
    }

    public async Task<int> RevokeAccessAsync(Guid userId, Guid areaId, CancellationToken cancellationToken = default)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var affected = await userAreaAccessProvider.RevokeAccessAsync(
                uow.Connection,
                userId,
                areaId,
                cancellationToken,
                uow.Transaction);

            await uow.CommitAsync(cancellationToken);
            return affected;
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            logger.LogError(e, "Ошибка при отзыве доступа пользователя {UserId} к области {AreaId}", userId, areaId);
            throw;
        }
    }

    public async Task<bool> CanAccessGroupAsync(Guid userId, Guid groupId, CancellationToken cancellationToken = default)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            // Получаем группу
            var group = await groupProvider.GetByIdAsync(
                uow.Connection,
                groupId,
                cancellationToken,
                uow.Transaction);

            if (group == null)
            {
                await uow.CommitAsync(cancellationToken);
                return false;
            }

            // Проверяем доступ к области группы
            var hasAccess = await userAreaAccessProvider.HasAccessAsync(
                uow.Connection,
                userId,
                group.AreaId,
                cancellationToken,
                uow.Transaction);

            await uow.CommitAsync(cancellationToken);
            return hasAccess;
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            logger.LogError(e, "Ошибка при проверке доступа пользователя {UserId} к группе {GroupId}", userId, groupId);
            throw;
        }
    }

    public async Task<bool> CanAccessTaskAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            // Получаем задачу
            var task = await taskProvider.GetByIdAsync(
                uow.Connection,
                taskId,
                cancellationToken,
                uow.Transaction);

            if (task == null)
            {
                await uow.CommitAsync(cancellationToken);
                return false;
            }

            // Проверяем доступ к области группы задачи
            var hasAccess = await CanAccessGroupAsync(userId, task.GroupId, cancellationToken);

            await uow.CommitAsync(cancellationToken);
            return hasAccess;
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            logger.LogError(e, "Ошибка при проверке доступа пользователя {UserId} к задаче {TaskId}", userId, taskId);
            throw;
        }
    }

    public async Task<bool> CanAccessSubtaskAsync(Guid userId, Guid subtaskId, CancellationToken cancellationToken = default)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            // Получаем подзадачу
            var subtask = await subtaskProvider.GetByIdAsync(
                uow.Connection,
                subtaskId,
                cancellationToken,
                uow.Transaction);

            if (subtask == null)
            {
                await uow.CommitAsync(cancellationToken);
                return false;
            }

            // Проверяем доступ к задаче подзадачи
            var hasAccess = await CanAccessTaskAsync(userId, subtask.TaskId, cancellationToken);

            await uow.CommitAsync(cancellationToken);
            return hasAccess;
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            logger.LogError(e, "Ошибка при проверке доступа пользователя {UserId} к подзадаче {SubtaskId}", userId, subtaskId);
            throw;
        }
    }
}
