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
    private readonly string _storagePath;
    private const long MaxFileSize = 20 * 1024 * 1024; // 20 MB

    public AttachmentService(TaskerDbContext context, IConfiguration configuration)
    {
        _context = context;
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

        await CheckAccessAsync(entityId, entityType, userId);

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
        await CheckAccessAsync(entityId, entityType, userId);

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

        await CheckAccessAsync(attachment.EntityId, attachment.EntityType, userId);

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

        // Проверка прав на удаление (только владелец или админ, или владелец сущности?)
        // Для простоты - проверяем доступ к сущности, но можно ужесточить: удалять может только тот кто загрузил 
        // или владелец сущности.
        // Пока оставим проверку доступа к сущности, как достаточное условие (если есть доступ к задаче, можно удалять файлы?)
        // Или только свои файлы?
        // "Сделай так, чтобы нельзя было просто запросить файл с сервера. Все файлы для скачивания запрашивались с указанием сущности в котороую она вложена."
        // Про удаление требований не было, но логично разрешить удалять свои файлы или владельцу сущности.
        
        await CheckAccessAsync(attachment.EntityId, attachment.EntityType, userId);

        // Soft delete
        attachment.IsActive = false;
        attachment.DeactivatedAt = DateTimeOffset.UtcNow;
        
        await _context.SaveChangesAsync();
    }

    private async Task CheckAccessAsync(Guid entityId, EntityType entityType, Guid userId)
    {
        // TODO: Реализовать полноценную проверку прав через существующие сервисы или логику
        // Пока реализуем базовую проверку существования и принадлежности (где применимо)
        
        bool hasAccess = false;
        
        switch (entityType)
        {
            case EntityType.TASK:
                var task = await _context.Tasks.AsNoTracking().FirstOrDefaultAsync(t => t.Id == entityId);
                // Простая проверка: если задача существует. 
                // В реальном приложении нужно проверять доступ пользователя к Area этой задачи.
                // Предполагаем, что доступ к задаче есть, если пользователь имеет доступ к Area.
                // Для MVP проверим, что задача существует. 
                // В будущем: внедрить IAreaService или ITaskService для проверки прав.
                hasAccess = task != null; 
                // Нужно проверить доступ к Area. 
                if (task != null)
                {
                   // Проверка через UserAreaAccesses
                   hasAccess = await HasAreaAccess(task.AreaId, userId);
                }
                break;
                
            case EntityType.EVENT:
                var evt = await _context.Events.AsNoTracking().FirstOrDefaultAsync(e => e.Id == entityId);
                hasAccess = evt != null;
                // События могут быть глобальными или привязаны к чему-то. 
                // Если событие личное (OwnerUserId), то доступ только у владельца?
                // Если событие в календаре...
                if (evt != null)
                {
                     hasAccess = evt.OwnerUserId == userId;
                }
                break;
                
            case EntityType.AREA:
                hasAccess = await HasAreaAccess(entityId, userId);
                break;
                
            case EntityType.FOLDER:
                var folder = await _context.Folders.AsNoTracking().FirstOrDefaultAsync(f => f.Id == entityId);
                if (folder != null)
                {
                    hasAccess = await HasAreaAccess(folder.AreaId, userId);
                }
                break;
                
            default:
                throw new Exception("Неизвестный тип сущности");
        }

        if (!hasAccess)
        {
            throw new UnauthorizedAccessException("Нет доступа к указанной сущности");
        }
    }

    private async Task<bool> HasAreaAccess(Guid areaId, Guid userId)
    {
        // Проверяем, является ли пользователь владельцем области или участником
        var area = await _context.Areas.AsNoTracking().FirstOrDefaultAsync(a => a.Id == areaId);
        if (area == null) return false;
        if (area.OwnerUserId == userId) return true;
        
        return await _context.UserAreaAccesses.AnyAsync(ua => ua.AreaId == areaId && ua.UserId == userId && ua.IsActive);
    }
}
