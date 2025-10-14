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
/// Сервис для работы с областями с использованием Entity Framework
/// </summary>
public class AreaService(
    ILogger<AreaService> logger,
    ICurrentUserService currentUser,
    IAreaRepository areaRepository,
    IGroupRepository groupRepository,
    IUserAreaAccessRepository userAreaAccessRepository,
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
            
            var accessibleAreas = areas.Where(a => CurrentUser.AccessibleAreas.Contains(a.Id));
            
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
            
            if (area == null || !CurrentUser.AccessibleAreas.Contains(area.Id))
            {
                return null;
            }

            return area.ToAreaResponse();
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

            var area = new AreaEntity
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                CreatorUserId = CurrentUser.UserId,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                IsActive = true
            };

            var createdArea = await areaRepository.CreateAsync(area, cancellationToken);

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

            if (!currentUser.AccessibleAreas.Contains(existingArea.Id))
            {
                throw new UnauthorizedAccessException("Доступ к данной области запрещен");
            }

            existingArea.Title = request.Title;
            existingArea.Description = request.Description;
            existingArea.UpdatedAt = DateTime.UtcNow;

            await areaRepository.UpdateAsync(existingArea, cancellationToken);
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

            if (!currentUser.AccessibleAreas.Contains(existingArea.Id))
            {
                throw new UnauthorizedAccessException("Доступ к данной области запрещен");
            }

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
        using var transaction = await context.Database.BeginTransactionAsync();
        try
        {
            var area = new AreaEntity
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                CreatorUserId = currentUser.UserId,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                IsActive = true
            };

            var createdArea = await areaRepository.CreateAsync(area, cancellationToken);

            var defaultGroup = new GroupEntity
            {
                Id = Guid.NewGuid(),
                Title = "Default Group",
                Description = "Default group for this area",
                AreaId = createdArea.Id,
                CreatorUserId = currentUser.UserId,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                IsActive = true
            };

            var createdGroup = await groupRepository.CreateAsync(defaultGroup, cancellationToken);

            var userAccess = new UserAreaAccessEntity
            {
                Id = Guid.NewGuid(),
                UserId = currentUser.UserId,
                AreaId = createdArea.Id,
                GrantedByUserId = currentUser.UserId,
                GrantedAt = DateTime.UtcNow,
                IsActive = true
            };

            await userAreaAccessRepository.CreateAsync(userAccess, cancellationToken);

            await transaction.CommitAsync();

            return new CreateAreaWithGroupResponse
            {
                Area = createdArea.ToAreaResponse(),
                DefaultGroup = createdGroup.ToGroupResponse()
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
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
            var accessibleAreas = areas.Where(a => currentUser.AccessibleAreas.Contains(a.Id));

            var result = new List<AreaShortCardResponse>();

            foreach (var area in accessibleAreas)
            {
                var groups = await groupRepository.GetByAreaIdAsync(area.Id, cancellationToken);
                var groupCount = groups.Count;

                result.Add(area.ToAreaShortCardResponse(groupCount));
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
