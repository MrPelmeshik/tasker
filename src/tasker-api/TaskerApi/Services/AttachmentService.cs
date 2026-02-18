using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using TaskerApi.Core;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Services;

public class AttachmentService : IAttachmentService
{
    private readonly TaskerDbContext _context;
    private readonly IAreaRoleService _areaRoleService;
    private readonly string _storagePath;
    private const long MaxFileSize = 20 * 1024 * 1024; // 20 MB

    public AttachmentService(
        TaskerDbContext context, 
        IConfiguration configuration,
        IAreaRoleService areaRoleService)
    {
        _context = context;
        _areaRoleService = areaRoleService;
        _storagePath = Path.Combine(Directory.GetCurrentDirectory(), "Attachments");
        
        if (!Directory.Exists(_storagePath))
        {
            Directory.CreateDirectory(_storagePath);
        }
    }

    public async Task<AttachmentEntity> UploadAsync(Guid entityId, EntityType entityType, IFormFile file, Guid userId)
    {
        if (file.Length > MaxFileSize)
        {
            throw new Exception($"Файл превышает допустимый размер {MaxFileSize / 1024 / 1024}МБ");
        }

        await CheckWriteAccessAsync(entityId, entityType, userId);

        var attachmentId = Guid.NewGuid();
        var storageFileName = $"{attachmentId}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(_storagePath, storageFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var attachment = new AttachmentEntity
        {
            Id = attachmentId,
            OriginalFileName = file.FileName,
            StorageFileName = storageFileName,
            ContentType = file.ContentType,
            Size = file.Length,
            EntityId = entityId,
            EntityType = entityType,
            OwnerUserId = userId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };

        _context.Attachments.Add(attachment);
        await _context.SaveChangesAsync();

        return attachment;
    }

    public async Task<List<AttachmentEntity>> GetListAsync(Guid entityId, EntityType entityType, Guid userId)
    {
        await CheckReadAccessAsync(entityId, entityType, userId);

        return await _context.Attachments
            .Where(a => a.EntityId == entityId && a.EntityType == entityType && a.IsActive)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<(Stream FileStream, string ContentType, string DownloadName)> DownloadAsync(Guid attachmentId, Guid userId)
    {
        var attachment = await _context.Attachments
            .FirstOrDefaultAsync(a => a.Id == attachmentId && a.IsActive);

        if (attachment == null)
        {
            throw new Exception("Вложение не найдено");
        }

        await CheckReadAccessAsync(attachment.EntityId, attachment.EntityType, userId);

        var filePath = Path.Combine(_storagePath, attachment.StorageFileName);
        if (!File.Exists(filePath))
        {
            throw new Exception("Файл не найден на диске");
        }

        var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
        return (stream, attachment.ContentType, attachment.OriginalFileName);
    }

    public async Task DeleteAsync(Guid attachmentId, Guid userId)
    {
        var attachment = await _context.Attachments
            .FirstOrDefaultAsync(a => a.Id == attachmentId && a.IsActive);

        if (attachment == null)
        {
            throw new Exception("Вложение не найдено");
        }
        
        // Для удаления требуем права на редактирование сущности
        await CheckWriteAccessAsync(attachment.EntityId, attachment.EntityType, userId);

        // Soft delete
        attachment.IsActive = false;
        attachment.DeactivatedAt = DateTimeOffset.UtcNow;
        
        await _context.SaveChangesAsync();
    }

    private async Task CheckReadAccessAsync(Guid entityId, EntityType entityType, Guid userId)
    {
        var (areaId, isOwner) = await GetEntityAreaIdAndOwnershipAsync(entityId, entityType, userId);

        bool hasAccess = false;
        if (areaId.HasValue)
        {
            hasAccess = await _areaRoleService.HasViewAccessAsync(areaId.Value);
        }
        else
        {
            // Если нет области (личная сущность), доступ только у владельца
            hasAccess = isOwner;
        }

        if (!hasAccess)
        {
            throw new UnauthorizedAccessException("Нет доступа к просмотру сущности");
        }
    }

    private async Task CheckWriteAccessAsync(Guid entityId, EntityType entityType, Guid userId)
    {
        var (areaId, isOwner) = await GetEntityAreaIdAndOwnershipAsync(entityId, entityType, userId);

        bool hasAccess = false;
        if (areaId.HasValue)
        {
            // Проверяем права на редактирование в зависимости от типа (обобщенно - CanAddActivity для вложений)
            // Но лучше проверить специфичные права, если это Task/Folder
            if (entityType == EntityType.TASK)
            {
                hasAccess = await _areaRoleService.CanEditTaskAsync(areaId.Value);
            }
            else if (entityType == EntityType.FOLDER)
            {
                hasAccess = await _areaRoleService.CanEditFolderAsync(areaId.Value);
            }
            else if (entityType == EntityType.AREA)
            {
                hasAccess = await _areaRoleService.CanEditAreaAsync(areaId.Value);
            }
            else
            {
                // Для Event и других - используем CanAddActivity как базовое право на изменение содержимого
                hasAccess = await _areaRoleService.CanAddActivityAsync(areaId.Value);
            }
        }
        else
        {
            // Личная сущность - только владелец
            hasAccess = isOwner;
        }

        if (!hasAccess)
        {
            throw new UnauthorizedAccessException("Нет доступа к изменению сущности");
        }
    }

    private async Task<(Guid? AreaId, bool IsOwner)> GetEntityAreaIdAndOwnershipAsync(Guid entityId, EntityType entityType, Guid userId)
    {
        Guid? areaId = null;
        bool isOwner = false;

        switch (entityType)
        {
            case EntityType.TASK:
                var task = await _context.Tasks.AsNoTracking().FirstOrDefaultAsync(t => t.Id == entityId);
                if (task != null)
                {
                    areaId = task.AreaId;
                    isOwner = task.OwnerUserId == userId;
                }
                break;
                
            case EntityType.EVENT:
                var evt = await _context.Events.AsNoTracking().FirstOrDefaultAsync(e => e.Id == entityId);
                if (evt != null)
                {
                    isOwner = evt.OwnerUserId == userId;
                    
                    // 1. Direct Area Link
                    var eventArea = await _context.EventToAreas.AsNoTracking()
                        .FirstOrDefaultAsync(ea => ea.EventId == entityId && ea.IsActive);
                    if (eventArea != null)
                    {
                        areaId = eventArea.AreaId;
                    }
                    else
                    {
                        // 2. Task Link (Explicit Query without Join for safety)
                        var eventTask = await _context.EventToTasks.AsNoTracking()
                            .FirstOrDefaultAsync(et => et.EventId == entityId && et.IsActive);
                        
                        if (eventTask != null)
                        {
                            var taskForEvent = await _context.Tasks.AsNoTracking()
                                .FirstOrDefaultAsync(t => t.Id == eventTask.TaskId);
                            if (taskForEvent != null)
                            {
                                areaId = taskForEvent.AreaId;
                            }
                        }
                        else
                        {
                            // 3. Subtask Link
                            var eventSubtask = await _context.EventToSubtasks.AsNoTracking()
                                .FirstOrDefaultAsync(est => est.EventId == entityId && est.IsActive);
                                
                            if (eventSubtask != null)
                            {
                                var subtask = await _context.Subtasks.AsNoTracking()
                                    .FirstOrDefaultAsync(s => s.Id == eventSubtask.SubtaskId);
                                    
                                if (subtask != null)
                                {
                                    var taskForSubtask = await _context.Tasks.AsNoTracking()
                                        .FirstOrDefaultAsync(t => t.Id == subtask.TaskId);
                                    if (taskForSubtask != null)
                                    {
                                        areaId = taskForSubtask.AreaId;
                                    }
                                }
                            }
                        }
                    }
                }
                break;
                
            case EntityType.AREA:
                areaId = entityId;
                // Check if user is owner of area directly
                var area = await _context.Areas.AsNoTracking().FirstOrDefaultAsync(a => a.Id == entityId);
                if (area != null) isOwner = area.OwnerUserId == userId;
                break;
                
            case EntityType.FOLDER:
                var folder = await _context.Folders.AsNoTracking().FirstOrDefaultAsync(f => f.Id == entityId);
                if (folder != null)
                {
                    areaId = folder.AreaId;
                    isOwner = folder.OwnerUserId == userId;
                }
                break;
                
            default:
                throw new Exception("Неизвестный тип сущности");
        }

        return (areaId, isOwner);
    }
}
