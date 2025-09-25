using TaskerApi.Interfaces.Core;
using TaskerApi.Interfaces.Models.Common;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Common.SqlFilters;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services;

public class TaskService(
    ILogger<TaskService> logger,
    IUnitOfWorkFactory uowFactory,
    ICurrentUserService currentUser,
    ITaskProvider taskProvider,
    IGroupProvider groupProvider,
    TableMetaInfo<TaskEntity> tasksTable)
    : ITaskService
{
    public async Task<IEnumerable<TaskResponse>> GetAsync(CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            // Получаем все задачи из групп, которые находятся в доступных пользователю областях
            var items = await taskProvider.GetListAsync(
                uow.Connection,
                cancellationToken,
                filers: [new ArraySqlFilter<Guid>(tasksTable[nameof(TaskEntity.GroupId)].DbName, currentUser.AccessibleGroups.ToArray())],
                transaction: uow.Transaction);

            await uow.CommitAsync(cancellationToken);
            return items.Select(x => new TaskResponse
            {
                Id = x.Id,
                Title = x.Title,
                Description = x.Description,
                GroupId = x.GroupId,
                CreatorUserId = x.CreatorUserId,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt,
                IsActive = x.IsActive,
                DeactivatedAt = x.DeactivatedAt
            });
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<TaskResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var item = await taskProvider.GetByIdAsync(
                uow.Connection,
                id,
                cancellationToken,
                transaction: uow.Transaction);

            if (item == null || !currentUser.AccessibleGroups.Contains(item.GroupId))
            {
                await uow.CommitAsync(cancellationToken);
                return null;
            }

            await uow.CommitAsync(cancellationToken);
            return new TaskResponse
            {
                Id = item.Id,
                Title = item.Title,
                Description = item.Description,
                GroupId = item.GroupId,
                CreatorUserId = item.CreatorUserId,
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt,
                IsActive = item.IsActive,
                DeactivatedAt = item.DeactivatedAt
            };
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<TaskCreateResponse> CreateAsync(TaskCreateRequest request, CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            // Проверяем доступ к группе
            if (!currentUser.AccessibleGroups.Contains(request.GroupId))
            {
                throw new UnauthorizedAccessException("Нет доступа к указанной группе");
            }

            // Проверяем существование группы
            var group = await groupProvider.GetByIdAsync(
                uow.Connection,
                request.GroupId,
                cancellationToken,
                transaction: uow.Transaction);

            if (group == null)
            {
                throw new KeyNotFoundException("Группа не найдена");
            }

            var id = await taskProvider.CreateAsync(
                uow.Connection,
                new TaskEntity()
                {
                    Id = Guid.NewGuid(),
                    Title = request.Title,
                    Description = request.Description,
                    GroupId = request.GroupId,
                    CreatorUserId = currentUser.UserId,
                },
                cancellationToken,
                uow.Transaction,
                setDefaultValues: true);

            await uow.CommitAsync(cancellationToken);
            return new TaskCreateResponse()
            {
                TaskId = id,
            };
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task UpdateAsync(Guid id, TaskUpdateRequest request, CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var existingItem = await taskProvider.GetByIdAsync(
                uow.Connection,
                id,
                cancellationToken,
                transaction: uow.Transaction);

            if (existingItem == null)
            {
                throw new KeyNotFoundException("Задача не найдена");
            }

            if (!currentUser.AccessibleGroups.Contains(existingItem.GroupId))
            {
                throw new UnauthorizedAccessException("Нет доступа к указанной задаче");
            }

            // Проверяем доступ к новой группе, если она изменилась
            if (existingItem.GroupId != request.GroupId && !currentUser.AccessibleGroups.Contains(request.GroupId))
            {
                throw new UnauthorizedAccessException("Нет доступа к указанной группе");
            }

            // Проверяем существование новой группы, если она изменилась
            if (existingItem.GroupId != request.GroupId)
            {
                var group = await groupProvider.GetByIdAsync(
                    uow.Connection,
                    request.GroupId,
                    cancellationToken,
                    transaction: uow.Transaction);

                if (group == null)
                {
                    throw new KeyNotFoundException("Группа не найдена");
                }
            }

            existingItem.Title = request.Title;
            existingItem.Description = request.Description;
            existingItem.GroupId = request.GroupId;

            await taskProvider.UpdateAsync(
                uow.Connection,
                existingItem,
                cancellationToken,
                transaction: uow.Transaction,
                setDefaultValues: true);

            await uow.CommitAsync(cancellationToken);
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<IEnumerable<TaskSummaryResponse>> GetTaskSummaryByGroupAsync(Guid groupId, CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            // Проверяем доступ к группе
            if (!currentUser.AccessibleGroups.Contains(groupId))
            {
                throw new UnauthorizedAccessException("Нет доступа к указанной группе");
            }

            var tasks = await taskProvider.GetListAsync(
                uow.Connection,
                cancellationToken,
                filers: [new SimpleFilter<Guid>(tasksTable[nameof(TaskEntity.GroupId)].DbName, groupId)],
                transaction: uow.Transaction);

            await uow.CommitAsync(cancellationToken);
            return tasks.Select(x => new TaskSummaryResponse
            {
                Id = x.Id,
                Title = x.Title,
                Description = x.Description
            });
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }
}


