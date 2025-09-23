using TaskerApi.Interfaces.Core;
using TaskerApi.Interfaces.Models.Common;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common.SqlFilters;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services;

public class GroupService(
    ILogger<GroupService> logger,
    IUnitOfWorkFactory uowFactory,
    ICurrentUserService currentUser,
    IGroupProvider groupProvider,
    IUserAreaAccessProvider userAreaAccessProvider)
    : IGroupService
{
    public async Task<IEnumerable<GroupResponse>> GetAsync(CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var items = await groupProvider.GetListAsync(
                uow.Connection,
                cancellationToken,
                filers: [new ArraySqlFilter<Guid>(nameof(GroupEntity.AreaId), currentUser.AccessibleAreas.ToArray())],
                transaction: uow.Transaction);

            await uow.CommitAsync(cancellationToken);
            return items.Select(x => new GroupResponse
            {
                Id = x.Id,
                Title = x.Title,
                Description = x.Description,
                AreaId = x.AreaId,
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

    public async Task<GroupResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var item = await groupProvider.GetByIdAsync(
                uow.Connection,
                id,
                cancellationToken,
                transaction: uow.Transaction);

            if (item == null || !currentUser.AccessibleAreas.Contains(item.AreaId))
            {
                await uow.CommitAsync(cancellationToken);
                return null;
            }

            await uow.CommitAsync(cancellationToken);
            return new GroupResponse
            {
                Id = item.Id,
                Title = item.Title,
                Description = item.Description,
                AreaId = item.AreaId,
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

    public async Task<GroupCreateResponse> CreateAsync(GroupCreateRequest item, CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            if (!currentUser.AccessibleAreas.Contains(item.AreaId))
            {
                throw new UnauthorizedAccessException("Нет доступа к указанной области");
            }

            var id = await groupProvider.CreateAsync(
                uow.Connection,
                new GroupEntity()
                {
                    Id = Guid.NewGuid(),
                    Title = item.Title,
                    Description = item.Description,
                    AreaId = item.AreaId,
                    CreatorUserId = currentUser.UserId,
                },
                cancellationToken,
                uow.Transaction,
                setDefaultValues: true);

            await uow.CommitAsync(cancellationToken);
            return new GroupCreateResponse()
            {
                GroupId = id,
            };
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task UpdateAsync(Guid id, GroupUpdateRequest item, CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var existingItem = await groupProvider.GetByIdAsync(
                uow.Connection,
                id,
                cancellationToken,
                transaction: uow.Transaction);

            if (existingItem == null)
            {
                throw new KeyNotFoundException("Группа не найдена");
            }

            if (!currentUser.AccessibleAreas.Contains(existingItem.AreaId))
            {
                throw new UnauthorizedAccessException("Нет доступа к указанной группе");
            }

            existingItem.Title = item.Title;
            existingItem.Description = item.Description;

            await groupProvider.UpdateAsync(
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
}