using Microsoft.AspNetCore.Http;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

public interface IAttachmentService
{
    Task<AttachmentEntity> UploadAsync(Guid entityId, EntityType entityType, IFormFile file, Guid userId);
    Task<List<AttachmentEntity>> GetListAsync(Guid entityId, EntityType entityType, Guid userId);
    Task<(Stream FileStream, string ContentType, string DownloadName)> DownloadAsync(Guid attachmentId, Guid userId);
    Task DeleteAsync(Guid attachmentId, Guid userId);
}
