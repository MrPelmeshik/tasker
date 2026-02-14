using TaskerApi.Core;
using TaskerApi.Helpers;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Services.Base;
using TaskerApi.Constants;
using TaskerApi.Services.Mapping;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для работы с областями с использованием Entity Framework
/// </summary>
public class AreaService(
    ILogger<AreaService> logger,
    ICurrentUserService currentUser,
    IAreaRepository areaRepository,
    IFolderRepository folderRepository,
    ITaskRepository taskRepository,
    IUserAreaAccessRepository userAreaAccessRepository,
    IUserRepository userRepository,
    IEntityEventLogger entityEventLogger,
    IAreaRoleService areaRoleService,
    IRealtimeNotifier realtimeNotifier,
    TaskerDbContext context)
    : BaseService(logger, currentUser), IAreaService
{
    public async Task<IEnumerable<AreaResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var areas = await areaRepository.GetAllAsync(cancellationToken);
            
            var accessibleAreas = areas.Where(a => CurrentUser.HasAccessToArea(a.Id));
            
            return accessibleAreas.Select(x => x.ToAreaResponse());
        }, nameof(GetAllAsync));
    }

    public async Task<AreaResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var area = await areaRepository.GetByIdAsync(id, cancellationToken);
            
            if (area == null || !CurrentUser.HasAccessToArea(area.Id))
            {
                return null;
            }

            var user = await userRepository.GetByIdAsync(area.OwnerUserId, cancellationToken);
            return area.ToAreaResponse(user?.Name ?? "");
        }, nameof(GetByIdAsync), new { id });
    }

    public async Task<AreaCreateResponse> CreateAsync(AreaCreateRequest request, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var existingArea = await areaRepository.GetByNameAsync(request.Title, cancellationToken);
            if (existingArea != null)
            {
                throw new InvalidOperationException(ErrorMessages.AreaWithSameNameExists);
            }

            var area = request.ToAreaEntity(CurrentUser.UserId);

            var createdArea = await areaRepository.CreateAsync(area, cancellationToken);
            var userAccess = createdArea.ToUserAreaAccessEntity(CurrentUser.UserId, CurrentUser.UserId, AreaRole.Owner);

            await userAreaAccessRepository.CreateAsync(userAccess, cancellationToken);

            await entityEventLogger.LogAsync(EntityType.AREA, createdArea.Id, EventType.CREATE, createdArea.Title, null, cancellationToken);
            await realtimeNotifier.NotifyEntityChangedAsync(EntityType.AREA, createdArea.Id, createdArea.Id, null, RealtimeEventType.Create, cancellationToken);

            return createdArea.ToAreaCreateResponse();
        }, nameof(CreateAsync), request);
    }

    public async Task UpdateAsync(Guid id, AreaUpdateRequest request, CancellationToken cancellationToken)
    {
        await ExecuteWithErrorHandling(async () =>
        {
            var existingArea = await areaRepository.GetByIdAsync(id, cancellationToken);
            if (existingArea == null)
                throw new InvalidOperationException(ErrorMessages.AreaNotFound);

            if (!await areaRoleService.CanEditAreaAsync(existingArea.Id, cancellationToken))
                throw new UnauthorizedAccessException(ErrorMessages.NoPermissionEditArea);

            var oldSnapshot = EventMessageHelper.ShallowClone(existingArea);
            request.UpdateAreaEntity(existingArea);
            await areaRepository.UpdateAsync(existingArea, cancellationToken);
            var messageJson = EventMessageHelper.BuildUpdateMessageJson(oldSnapshot, existingArea);
            await entityEventLogger.LogAsync(EntityType.AREA, id, EventType.UPDATE, existingArea.Title, messageJson, cancellationToken);
            await realtimeNotifier.NotifyEntityChangedAsync(EntityType.AREA, id, id, null, RealtimeEventType.Update, cancellationToken);
        }, nameof(UpdateAsync), new { id, request });
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        await ExecuteWithErrorHandling(async () =>
        {
            var existingArea = await areaRepository.GetByIdAsync(id, cancellationToken);
            if (existingArea == null)
                throw new InvalidOperationException(ErrorMessages.AreaNotFound);

            if (!await areaRoleService.CanCreateOrDeleteStructureAsync(existingArea.Id, cancellationToken))
                throw new UnauthorizedAccessException(ErrorMessages.OnlyOwnerCanDeleteArea);

            await entityEventLogger.LogAsync(EntityType.AREA, id, EventType.DELETE, existingArea.Title, null, cancellationToken);
            await realtimeNotifier.NotifyEntityChangedAsync(EntityType.AREA, id, id, null, RealtimeEventType.Delete, cancellationToken);
            await areaRepository.DeleteAsync(id, cancellationToken);
        }, nameof(DeleteAsync), new { id });
    }

    /// <summary>
    /// Получить краткие карточки областей
    /// </summary>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Список кратких карточек областей</returns>
    public async Task<IEnumerable<AreaShortCardResponse>> GetAreaShortCardAsync(CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var areas = await areaRepository.GetAllAsync(cancellationToken);
            var accessibleAreas = areas.Where(a => CurrentUser.HasAccessToArea(a.Id)).ToList();

            var userIds = accessibleAreas.Select(a => a.OwnerUserId).Distinct().ToHashSet();
            var users = await userRepository.FindAsync(u => userIds.Contains(u.Id), cancellationToken);
            var userNames = users.ToDictionary(u => u.Id, u => u.Name);

            var areaIds = accessibleAreas.Select(a => a.Id).ToList();
            var rootFolderCounts = await folderRepository.GetRootCountByAreaIdsAsync(areaIds, cancellationToken);
            var rootTaskCounts = await taskRepository.GetRootTaskCountByAreaIdsAsync(areaIds, cancellationToken);

            var result = new List<AreaShortCardResponse>();
            foreach (var area in accessibleAreas)
            {
                var rootFolderCount = rootFolderCounts.GetValueOrDefault(area.Id, 0);
                var rootTaskCount = rootTaskCounts.GetValueOrDefault(area.Id, 0);
                var ownerName = userNames.GetValueOrDefault(area.OwnerUserId, "");
                result.Add(area.ToAreaShortCardResponse(rootFolderCount, rootTaskCount, ownerName));
            }
            return result;
        }, nameof(GetAreaShortCardAsync));
    }
}
