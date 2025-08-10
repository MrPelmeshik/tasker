using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Entities;
using TaskerApi.Infrastructure;

namespace TaskerApi.Providers;

public class FileProvider : BaseProvider<FileEntity, Guid>, IFileProvider
{
    public FileProvider(IUnitOfWorkFactory unitOfWorkFactory) : base(unitOfWorkFactory)
    {
    }

    public async Task<IEnumerable<FileEntity>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT id, filename, mime_type, byte_size, storage_url, user_id, created, is_active, deactivated
            FROM files 
            WHERE user_id = @UserId AND is_active = true
            ORDER BY created DESC";
        
        return await connection.QueryAsync<FileEntity>(sql, new { UserId = userId });
    }

    public async Task<IEnumerable<FileEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT f.id, f.filename, f.mime_type, f.byte_size, f.storage_url, f.user_id, f.created, f.is_active, f.deactivated
            FROM files f
            INNER JOIN file_area fa ON f.id = fa.file_id
            WHERE fa.area_id = @AreaId AND f.is_active = true AND fa.is_active = true
            ORDER BY f.created DESC";
        
        return await connection.QueryAsync<FileEntity>(sql, new { AreaId = areaId });
    }

    public async Task<IEnumerable<FileEntity>> GetByTaskAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT f.id, f.filename, f.mime_type, f.byte_size, f.storage_url, f.user_id, f.created, f.is_active, f.deactivated
            FROM files f
            INNER JOIN file_task ft ON f.id = ft.file_id
            WHERE ft.task_id = @TaskId AND f.is_active = true AND ft.is_active = true
            ORDER BY f.created DESC";
        
        return await connection.QueryAsync<FileEntity>(sql, new { TaskId = taskId });
    }

    public async Task<IEnumerable<FileEntity>> GetByActionAsync(Guid actionId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT f.id, f.filename, f.mime_type, f.byte_size, f.storage_url, f.user_id, f.created, f.is_active, f.deactivated
            FROM files f
            INNER JOIN file_action fa ON f.id = fa.file_id
            WHERE fa.action_id = @ActionId AND f.is_active = true AND fa.is_active = true
            ORDER BY f.created DESC";
        
        return await connection.QueryAsync<FileEntity>(sql, new { ActionId = actionId });
    }

    public async Task<FileEntity?> GetByStorageUrlAsync(string storageUrl, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT id, filename, mime_type, byte_size, storage_url, user_id, created, is_active, deactivated
            FROM files 
            WHERE storage_url = @StorageUrl AND is_active = true";
        
        return await connection.QueryFirstOrDefaultAsync<FileEntity>(sql, new { StorageUrl = storageUrl });
    }

    public async Task<IEnumerable<FileEntity>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT id, filename, mime_type, byte_size, storage_url, user_id, created, is_active, deactivated
            FROM files 
            WHERE is_active = true
            ORDER BY created DESC";
        
        return await connection.QueryAsync<FileEntity>(sql);
    }
}
