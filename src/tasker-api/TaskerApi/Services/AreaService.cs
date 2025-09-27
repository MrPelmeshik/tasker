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

public class AreaService(
    ILogger<AreaService> logger,
    IUnitOfWorkFactory uowFactory,
    ICurrentUserService currentUser,
    IAreaProvider areaProvider,
    IGroupProvider groupProvider,
    IUserAreaAccessProvider userAreaAccessProvider,
    IEventAreaService eventService)
    : IAreaService
{
    public async Task<IEnumerable<AreaResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var items = await areaProvider.GetListAsync(
                uow.Connection,
                cancellationToken,
                filers: [new ArraySqlFilter<Guid>(areaProvider.Table[nameof(AreaEntity.Id)], currentUser.AccessibleAreas.ToArray())],
                transaction: uow.Transaction);

            await uow.CommitAsync(cancellationToken);
            return items.Select(x => new AreaResponse
            {
                Id = x.Id,
                Title = x.Title,
                Description = x.Description,
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

    public async Task<AreaResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var item = await areaProvider.GetByIdAsync(
                uow.Connection,
                id,
                cancellationToken,
                transaction: uow.Transaction);
            
            if (item == null)
            {
                await uow.CommitAsync(cancellationToken);
                return null;
            }
            
            if (!currentUser.AccessibleAreas.Contains(item.Id))
            {
                throw new UnauthorizedAccessException("Нет доступа к указанной области");
            }

            await uow.CommitAsync(cancellationToken);
            return new AreaResponse
            {
                Id = item.Id,
                Title = item.Title,
                Description = item.Description,
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

    public async Task<AreaCreateResponse> CreateAsync(AreaCreateRequest item, CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var id = await areaProvider.CreateAsync(
                uow.Connection,
                new AreaEntity()
                {
                    Id = Guid.NewGuid(),
                    Title = item.Title,
                    Description = item.Description,
                    CreatorUserId = currentUser.UserId,
                },
                cancellationToken,
                uow.Transaction,
                true);

            await userAreaAccessProvider
                .GrantAccessAsync(
                    uow.Connection,
                    currentUser.UserId,
                    id,
                    currentUser.UserId,
                    cancellationToken,
                    uow.Transaction);

            await eventService.AddEventCreateEntityAsync(uow, id, cancellationToken);
            
            await uow.CommitAsync(cancellationToken);
            return new AreaCreateResponse()
            {
                AreaId = id,
            };
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task UpdateAsync(Guid id, AreaUpdateRequest item, CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var existingItem = await areaProvider.GetByIdAsync(
                uow.Connection,
                id,
                cancellationToken,
                transaction: uow.Transaction);

            if (existingItem == null)
            {
                throw new KeyNotFoundException("Область не найдена");
            }

            if (!currentUser.AccessibleAreas.Contains(existingItem.Id))
            {
                throw new UnauthorizedAccessException("Нет доступа к указанной области");
            }

            var oldTitle = existingItem.Title;
            var oldDescription = existingItem.Description;

            existingItem.Title = item.Title;
            existingItem.Description = item.Description;

            await areaProvider.UpdateAsync(
                uow.Connection,
                existingItem,
                cancellationToken,
                transaction: uow.Transaction,
                setDefaultValues: true);

            var changes = new List<string>();
            if (oldTitle != item.Title)
                changes.Add($"Заголовок: '{oldTitle}' → '{item.Title}'");
            if (oldDescription != item.Description)
                changes.Add($"Описание: '{oldDescription}' → '{item.Description}'");

            await eventService.AddEventUpdateEntityAsync(
                uow,
                id, 
                string.Join(", ", changes),
                cancellationToken);

            await uow.CommitAsync(cancellationToken);
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<IEnumerable<AreaShortCardResponse>> GetAreaShortCardAsync(CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var areas = await areaProvider.GetListAsync(
                uow.Connection,
                cancellationToken,
                filers: [new ArraySqlFilter<Guid>(areaProvider.Table[nameof(AreaEntity.Id)], currentUser.AccessibleAreas.ToArray())],
                transaction: uow.Transaction);

            var result = new List<AreaShortCardResponse>();

            foreach (var area in areas)
            {
                var groupsCount = await groupProvider.GetCountAsync(
                    uow.Connection,
                    cancellationToken,
                    filers: [new SimpleFilter<Guid>(areaProvider.Table[nameof(GroupEntity.AreaId)], area.Id)],
                    transaction: uow.Transaction);

                result.Add(new AreaShortCardResponse
                {
                    Id = area.Id,
                    Title = area.Title,
                    Description = area.Description,
                    GroupsCount = groupsCount
                });
            }

            await uow.CommitAsync(cancellationToken);
            return result;
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var existingItem = await areaProvider.GetByIdAsync(
                uow.Connection,
                id,
                cancellationToken,
                transaction: uow.Transaction);

            if (existingItem == null)
            {
                throw new KeyNotFoundException("Область не найдена");
            }

            if (!currentUser.AccessibleAreas.Contains(existingItem.Id))
            {
                throw new UnauthorizedAccessException("Нет доступа к указанной области");
            }

            await eventService.AddEventDeleteEntityAsync(uow, id, cancellationToken);

            await areaProvider.DeleteAsync(
                uow.Connection,
                id,
                cancellationToken,
                transaction: uow.Transaction);

            await uow.CommitAsync(cancellationToken);
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }
}