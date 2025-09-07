using TaskerApi.Interfaces.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Services;

public class AreaService(
    ILogger<EventService> logger,
    IUnitOfWorkFactory uowFactory,
    IAreaProvider areaProvider)
    : IAreaService
{
    public async Task<IEnumerable<AreaResponse>> GetAsync(CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var items = await areaProvider.GetListAsync(
                uow.Connection,
                cancellationToken,
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

    public async Task<AreaCreateResponse> CreateAsync(AreaCreateRequest item, CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var id = await areaProvider.CreateAsync(
                uow.Connection,
                new AreaEntity()
                {
                    Title = item.Title,
                    Description = item.Description,
                },
                cancellationToken,
                uow.Transaction,
                true);

            await uow.CommitAsync(cancellationToken);
            return new AreaCreateResponse()
            {
                Id = id,
            };
        }
        catch (Exception e)
        {
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
    }
}