using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Services.Base;
using TaskerApi.Services.Mapping;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для работы с областями с использованием Entity Framework
/// </summary>
public class AreaService(
    ILogger<AreaService> logger,
    ICurrentUserService currentUser,
    IAreaRepository areaRepository,
    IGroupRepository groupRepository,
    IUserAreaAccessRepository userAreaAccessRepository,
    IUserRepository userRepository,
    IEntityEventLogger entityEventLogger,
    IAreaRoleService areaRoleService,
    TaskerDbContext context)
    : BaseService(logger, currentUser), IAreaService
{
    /// <summary>
    /// Получить все области
    /// </summary>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Список всех доступных областей</returns>
    public async Task<IEnumerable<AreaResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var areas = await areaRepository.GetAllAsync(cancellationToken);
            
            var accessibleAreas = areas.Where(a => CurrentUser.HasAccessToArea(a.Id));
            
            return accessibleAreas.Select(x => x.ToAreaResponse());
        }, nameof(GetAllAsync));
    }

    /// <summary>
    /// Получить область по идентификатору
    /// </summary>
    /// <param name="id">Идентификатор области</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Область или null, если не найдена</returns>
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

    /// <summary>
    /// Создать новую область
    /// </summary>
    /// <param name="request">Данные для создания области</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Созданная область</returns>
    public async Task<AreaCreateResponse> CreateAsync(AreaCreateRequest request, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var existingArea = await areaRepository.GetByNameAsync(request.Title, cancellationToken);
            if (existingArea != null)
            {
                throw new InvalidOperationException("Область с таким названием уже существует");
            }

            var area = request.ToAreaEntity(CurrentUser.UserId);

            var createdArea = await areaRepository.CreateAsync(area, cancellationToken);
            var userAccess = createdArea.ToUserAreaAccessEntity(CurrentUser.UserId, CurrentUser.UserId, AreaRole.Owner);

            await userAreaAccessRepository.CreateAsync(userAccess, cancellationToken);

            await entityEventLogger.LogAsync(EntityType.AREA, createdArea.Id, EventType.CREATE, createdArea.Title, null, cancellationToken);

            return createdArea.ToAreaCreateResponse();
        }, nameof(CreateAsync), request);
    }

    /// <summary>
    /// Обновить область
    /// </summary>
    /// <param name="id">Идентификатор области</param>
    /// <param name="request">Данные для обновления</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    public async Task UpdateAsync(Guid id, AreaUpdateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var existingArea = await areaRepository.GetByIdAsync(id, cancellationToken);
            if (existingArea == null)
            {
                throw new InvalidOperationException("Область не найдена");
            }

            if (!await areaRoleService.CanEditAreaAsync(existingArea.Id, cancellationToken))
            {
                throw new UnauthorizedAccessException("Нет прав на редактирование области");
            }

            var oldSnapshot = EventMessageHelper.ShallowClone(existingArea);

            request.UpdateAreaEntity(existingArea);

            await areaRepository.UpdateAsync(existingArea, cancellationToken);

            var messageJson = EventMessageHelper.BuildUpdateMessageJson(oldSnapshot, existingArea);

            await entityEventLogger.LogAsync(EntityType.AREA, id, EventType.UPDATE, existingArea.Title, messageJson, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка обновления области {AreaId}", id);
            throw;
        }
    }

    /// <summary>
    /// Удалить область
    /// </summary>
    /// <param name="id">Идентификатор области</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var existingArea = await areaRepository.GetByIdAsync(id, cancellationToken);
            if (existingArea == null)
            {
                throw new InvalidOperationException("Область не найдена");
            }

            if (!await areaRoleService.CanCreateOrDeleteStructureAsync(existingArea.Id, cancellationToken))
            {
                throw new UnauthorizedAccessException("Только владелец области может удалить область");
            }

            await entityEventLogger.LogAsync(EntityType.AREA, id, EventType.DELETE, existingArea.Title, null, cancellationToken);

            await areaRepository.DeleteAsync(id, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка удаления области {AreaId}", id);
            throw;
        }
    }

    /// <summary>
    /// Создать область с группой по умолчанию (сложная операция с явной транзакцией)
    /// </summary>
    /// <param name="request">Данные для создания области с группой</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Созданная область с группой</returns>
    public async Task<CreateAreaWithGroupResponse> CreateWithDefaultGroupAsync(CreateAreaWithGroupRequest request, CancellationToken cancellationToken)
    {
        using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var area = request.ToAreaEntity(currentUser.UserId);

            var createdArea = await areaRepository.CreateAsync(area, cancellationToken);

            await entityEventLogger.LogAsync(EntityType.AREA, createdArea.Id, EventType.CREATE, createdArea.Title, null, cancellationToken);

            var defaultGroup = createdArea.ToDefaultGroupEntity(currentUser.UserId);

            var createdGroup = await groupRepository.CreateAsync(defaultGroup, cancellationToken);

            await entityEventLogger.LogAsync(EntityType.GROUP, createdGroup.Id, EventType.CREATE, createdGroup.Title, null, cancellationToken);

            var userAccess = createdArea.ToUserAreaAccessEntity(currentUser.UserId, currentUser.UserId, AreaRole.Owner);

            await userAreaAccessRepository.CreateAsync(userAccess, cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            return createdArea.ToCreateAreaWithGroupResponse(createdGroup);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            logger.LogError(ex, "Ошибка создания области с группой по умолчанию");
            throw;
        }
    }

    /// <summary>
    /// Получить краткие карточки областей
    /// </summary>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Список кратких карточек областей</returns>
    public async Task<IEnumerable<AreaShortCardResponse>> GetAreaShortCardAsync(CancellationToken cancellationToken)
    {
        try
        {
            var areas = await areaRepository.GetAllAsync(cancellationToken);
            var accessibleAreas = areas.Where(a => CurrentUser.HasAccessToArea(a.Id)).ToList();

            // Пакетная загрузка имён владельцев
            var userIds = accessibleAreas.Select(a => a.OwnerUserId).Distinct().ToHashSet();
            var users = await userRepository.FindAsync(u => userIds.Contains(u.Id), cancellationToken);
            var userNames = users.ToDictionary(u => u.Id, u => u.Name);

            var result = new List<AreaShortCardResponse>();

            foreach (var area in accessibleAreas)
            {
                var groups = await groupRepository.GetByAreaIdAsync(area.Id, cancellationToken);
                var groupCount = groups.Count;
                var ownerName = userNames.GetValueOrDefault(area.OwnerUserId, "");

                result.Add(area.ToAreaShortCardResponse(groupCount, ownerName));
            }

            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка получения кратких карточек областей");
            throw;
        }
    }
}
