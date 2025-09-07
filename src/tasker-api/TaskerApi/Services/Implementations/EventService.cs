using TaskerApi.Core.Interfaces;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Providers.Interfaces;
using TaskerApi.Services.Interfaces;

namespace TaskerApi.Services.Implementations;

public class EventService(
    ILogger<EventService> logger, 
    IUnitOfWorkFactory uowFactory, 
    IEventProvider eventProvider,
    IEventToAreaByEventProvider eventToAreaByEventProvider,
    IEventToGroupByEventProvider eventToGroupByEventProvider)
    : IEventService
{
    public async Task<EventCreateResponse> CreateAsync(EventCreateByAreaRequest item, CancellationToken cancellationToken)
    {
        logger.LogInformation("Create event");
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var eventId = await eventProvider.CreateAsync(
                uow.Connection, 
                new EventEntity
                {
                    Title = item.Title,
                    Description = item.Description,
                    CreatorUserId = item.CreatorUserId,
                }, 
                cancellationToken,
                uow.Transaction,
                true);

            await eventToAreaByEventProvider.CreateAsync(
                uow.Connection, 
                new EventToAreaByEventEntity
                {
                    Id = eventId,
                    AreaId = item.AreaId,
                    CreatorUserId = item.CreatorUserId,
                },
                cancellationToken,
                uow.Transaction,
                true);

            await uow.CommitAsync(cancellationToken);
            logger.LogInformation("Event created");
            return new EventCreateResponse
            {
                Id = eventId,
            };
        }
        catch (Exception e)
        {
            logger.LogError(e, "Create event error");
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
        finally
        {
            logger.LogInformation("Create event end");
        }
    }
    
    public async Task<EventCreateResponse> CreateAsync(EventCreateByGroupRequest item, CancellationToken cancellationToken)
    {
        logger.LogInformation("Create event");
        await using var uow = await uowFactory.CreateAsync(cancellationToken, true);

        try
        {
            var eventId = await eventProvider.CreateAsync(
                uow.Connection, 
                new EventEntity
                {
                    Title = item.Title,
                    Description = item.Description,
                    CreatorUserId = item.CreatorUserId,
                }, 
                cancellationToken,
                uow.Transaction,
                true);

            await eventToGroupByEventProvider.CreateAsync(
                uow.Connection, 
                new EventToGroupByEventEntity
                {
                    Id = eventId,
                    GroupId = item.GroupId,
                    CreatorUserId = item.CreatorUserId,
                },
                cancellationToken,
                uow.Transaction,
                true);

            await uow.CommitAsync(cancellationToken);
            logger.LogInformation("Event created");
            return new EventCreateResponse
            {
                Id = eventId,
            };
        }
        catch (Exception e)
        {
            logger.LogError(e, "Create event error");
            await uow.RollbackAsync(cancellationToken);
            throw;
        }
        finally
        {
            logger.LogInformation("Create event end");
        }
    }
}