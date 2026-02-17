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
/// Сервис для работы с папками с использованием Entity Framework
/// </summary>
public class FolderService(
    ILogger<FolderService> logger,
    ICurrentUserService currentUser,
    IFolderRepository folderRepository,
    IAreaRepository areaRepository,
    ITaskRepository taskRepository,
    IUserRepository userRepository,
    IEntityEventLogger entityEventLogger,
    IAreaRoleService areaRoleService,
    IRealtimeNotifier realtimeNotifier)
    : BaseService(logger, currentUser), IFolderService
{
    /// <summary>
    /// Получить все папки
    /// </summary>
    public async Task<IEnumerable<FolderResponse>> GetAsync(CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var folders = await folderRepository.GetAllAsync(cancellationToken);
            var accessible = folders.Where(f => CurrentUser.HasAccessToArea(f.AreaId));
            return accessible.Select(f => f.ToFolderResponse());
        }, nameof(GetAsync));
    }

    /// <summary>
    /// Получить папку по идентификатору
    /// </summary>
    public async Task<FolderResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var folder = await folderRepository.GetByIdAsync(id, cancellationToken);
            if (folder == null || !CurrentUser.HasAccessToArea(folder.AreaId))
                return null;

            var user = await userRepository.GetByIdAsync(folder.OwnerUserId, cancellationToken);
            return folder.ToFolderResponse(user?.Name ?? "");
        }, nameof(GetByIdAsync), new { id });
    }

    /// <summary>
    /// Создать новую папку
    /// </summary>
    public async Task<FolderResponse> CreateAsync(FolderCreateRequest request, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var area = await areaRepository.GetByIdAsync(request.AreaId, cancellationToken);
            if (area == null)
                throw new InvalidOperationException(ErrorMessages.AreaNotFound);

            if (!await areaRoleService.CanCreateOrDeleteStructureAsync(area.Id, cancellationToken))
                throw new UnauthorizedAccessException(ErrorMessages.OnlyOwnerCanCreateFolders);

            await ValidateNoCycleAsync(null, request.ParentFolderId, request.AreaId, cancellationToken);

            if (request.ParentFolderId.HasValue)
            {
                var parent = await folderRepository.GetByIdAsync(request.ParentFolderId.Value, cancellationToken);
                if (parent == null || parent.AreaId != request.AreaId)
                    throw new InvalidOperationException(ErrorMessages.ParentFolderNotFound);
            }

            var folder = request.ToFolderEntity(CurrentUser.UserId);
            var created = await folderRepository.CreateAsync(folder, cancellationToken);

            await entityEventLogger.LogAsync(EntityType.FOLDER, created.Id, EventType.CREATE, created.Title, null, cancellationToken);
            await realtimeNotifier.NotifyEntityChangedAsync(EntityType.FOLDER, created.Id, created.AreaId, created.ParentFolderId, RealtimeEventType.Create, cancellationToken);

            return created.ToFolderResponse();
        }, nameof(CreateAsync), request);
    }

    /// <summary>
    /// Обновить папку
    /// </summary>
    public async Task<FolderResponse> UpdateAsync(Guid id, FolderUpdateRequest request, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var folder = await folderRepository.GetByIdAsync(id, cancellationToken);
            if (folder == null)
                throw new InvalidOperationException(ErrorMessages.FolderNotFound);

            if (!await areaRoleService.CanEditFolderAsync(folder.AreaId, cancellationToken))
                throw new UnauthorizedAccessException(ErrorMessages.NoPermissionEditFolder);

            await ValidateNoCycleAsync(id, request.ParentFolderId, request.AreaId, cancellationToken);

            if (request.ParentFolderId.HasValue)
            {
                if (request.ParentFolderId == id)
                    throw new InvalidOperationException(ErrorMessages.FolderCannotBeParentOfItself);

                var parent = await folderRepository.GetByIdAsync(request.ParentFolderId.Value, cancellationToken);
                if (parent == null || parent.AreaId != request.AreaId)
                    throw new InvalidOperationException(ErrorMessages.ParentFolderNotFound);
            }

            var oldSnapshot = EventMessageHelper.ShallowClone(folder);
            var areaChanged = folder.AreaId != request.AreaId;
            List<Guid> subfolderIds = new();
            
            if (areaChanged)
            {
                if (!await areaRoleService.CanCreateOrDeleteStructureAsync(request.AreaId, cancellationToken))
                    throw new UnauthorizedAccessException(ErrorMessages.NoPermissionCreateFolders);
                
                // Сначала получаем ID всех подпапок, пока родитель еще в старой области
                // (иначе поиск будет искать детей в новой области, где их еще нет)
                var ids = await folderRepository.GetSubfolderIdsRecursiveAsync(id, cancellationToken);
                subfolderIds = ids.ToList();
            }

            request.UpdateFolderEntity(folder);

            await folderRepository.UpdateAsync(folder, cancellationToken);
            
            // Если область изменилась, рекурсивно обновляем AreaId у всех подпапок и задач
            if (areaChanged)
            {
                // 1. Обновляем AreaId у подпапок
                if (subfolderIds.Any())
                {
                    await folderRepository.BatchUpdateAreaIdAsync(subfolderIds, request.AreaId, cancellationToken);
                }
                
                // 2. Обновляем AreaId у задач во всех этих папках (включая текущую)
                var allFolderIds = subfolderIds.Append(id).ToList();
                await taskRepository.BatchUpdateAreaIdByFolderIdsAsync(allFolderIds, request.AreaId, cancellationToken);
            }

            var messageJson = EventMessageHelper.BuildUpdateMessageJson(oldSnapshot, folder);
            await entityEventLogger.LogAsync(EntityType.FOLDER, id, EventType.UPDATE, folder.Title, messageJson, cancellationToken);
            await realtimeNotifier.NotifyEntityChangedAsync(EntityType.FOLDER, id, folder.AreaId, folder.ParentFolderId, RealtimeEventType.Update, cancellationToken);

            return folder.ToFolderResponse();
        }, nameof(UpdateAsync), new { id, request });
    }

    /// <summary>
    /// Удалить папку
    /// </summary>
    /// <summary>
    /// Удалить папку (иерархически)
    /// </summary>
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        await ExecuteWithErrorHandling(async () =>
        {
            var folder = await folderRepository.GetByIdAsync(id, cancellationToken);
            if (folder == null)
                throw new InvalidOperationException(ErrorMessages.FolderNotFound);

            if (!await areaRoleService.CanCreateOrDeleteStructureAsync(folder.AreaId, cancellationToken))
                throw new UnauthorizedAccessException(ErrorMessages.OnlyOwnerCanDeleteFolders);

            // 1. Получаем ID всех подпапок
            var subfolderIds = await folderRepository.GetSubfolderIdsRecursiveAsync(id, cancellationToken);
            var allFolderIds = subfolderIds.Append(id).ToList();

            // 2. Удаляем задачи во всех этих папках
            await taskRepository.BatchSoftDeleteByFolderIdsAsync(allFolderIds, cancellationToken);

            // 3. Удаляем сами папки (включая текущую)
            // Важно: Сначала уведомляем о главной удаляемой папке, пока она еще есть (хотя это soft delete, так что она есть)
            await entityEventLogger.LogAsync(EntityType.FOLDER, id, EventType.DELETE, folder.Title, null, cancellationToken);
            await realtimeNotifier.NotifyEntityChangedAsync(EntityType.FOLDER, id, folder.AreaId, folder.ParentFolderId, RealtimeEventType.Delete, cancellationToken);

            await folderRepository.BatchSoftDeleteAsync(allFolderIds, cancellationToken);

        }, nameof(DeleteAsync), new { id });
    }

    /// <summary>
    /// Получить корневые папки по области
    /// </summary>
    public async Task<IEnumerable<FolderSummaryResponse>> GetRootByAreaAsync(Guid areaId, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            if (!CurrentUser.HasAccessToArea(areaId))
                throw new UnauthorizedAccessException(ErrorMessages.AccessAreaDeniedThis);

            var folders = await folderRepository.GetRootByAreaIdAsync(areaId, cancellationToken);
            return await ToFolderSummaryList(folders, cancellationToken);
        }, nameof(GetRootByAreaAsync), new { areaId });
    }

    /// <summary>
    /// Получить подпапки по родительской папке
    /// </summary>
    public async Task<IEnumerable<FolderSummaryResponse>> GetByParentAsync(Guid? parentFolderId, Guid areaId, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            if (!CurrentUser.HasAccessToArea(areaId))
                throw new UnauthorizedAccessException(ErrorMessages.AccessAreaDeniedThis);

            var folders = await folderRepository.GetByParentIdAsync(parentFolderId, cancellationToken);
            var inArea = folders.Where(f => f.AreaId == areaId).ToList();
            return await ToFolderSummaryList(inArea, cancellationToken);
        }, nameof(GetByParentAsync), new { parentFolderId, areaId });
    }

    /// <summary>
    /// Проверка отсутствия циклической вложенности при установке parent_folder_id
    /// </summary>
    private async Task ValidateNoCycleAsync(Guid? folderId, Guid? newParentId, Guid areaId, CancellationToken cancellationToken)
    {
        if (!newParentId.HasValue)
            return;

        var ancestors = new HashSet<Guid>();
        var current = newParentId;

        while (current.HasValue)
        {
            if (folderId.HasValue && current == folderId.Value)
                throw new InvalidOperationException(ErrorMessages.FolderCycle);

            ancestors.Add(current.Value);
            current = await folderRepository.GetParentFolderIdAsync(current.Value, cancellationToken);
        }
    }

    private async Task<List<FolderSummaryResponse>> ToFolderSummaryList(IReadOnlyList<FolderEntity> folders, CancellationToken cancellationToken)
    {
        if (folders.Count == 0)
            return new List<FolderSummaryResponse>();

        var folderIds = folders.Select(f => f.Id).ToList();
        var taskCounts = await taskRepository.GetTaskCountByFolderIdsAsync(folderIds, cancellationToken);
        var subfolderCounts = await folderRepository.GetSubfolderCountByFolderIdsAsync(folderIds, cancellationToken);

        var userIds = folders.Select(f => f.OwnerUserId).Distinct().ToHashSet();
        var users = await userRepository.FindAsync(u => userIds.Contains(u.Id), cancellationToken);
        var userNames = users.ToDictionary(u => u.Id, u => u.Name);

        var result = new List<FolderSummaryResponse>();
        foreach (var folder in folders)
        {
            var taskCount = taskCounts.GetValueOrDefault(folder.Id, 0);
            var subfolderCount = subfolderCounts.GetValueOrDefault(folder.Id, 0);
            var ownerName = userNames.GetValueOrDefault(folder.OwnerUserId, "");
            result.Add(folder.ToFolderSummaryResponse(taskCount, subfolderCount, ownerName));
        }

        return result;
    }
}
