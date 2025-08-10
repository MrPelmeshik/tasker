using TaskerApi.Interfaces.Services;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Entities;
using TaskerApi.Infrastructure;
using System.Data;
using Dapper;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для управления связями файлов с объектами системы.
/// </summary>
public class FileLinkService : IFileLinkService
{
    private readonly IUnitOfWorkFactory _unitOfWorkFactory;
    private readonly IFileProvider _fileProvider;

    public FileLinkService(
        IUnitOfWorkFactory unitOfWorkFactory,
        IFileProvider fileProvider)
    {
        _unitOfWorkFactory = unitOfWorkFactory;
        _fileProvider = fileProvider;
    }

    /// <summary>
    /// Связать файл с действием.
    /// </summary>
    public async Task LinkFileToActionAsync(Guid fileId, Guid actionId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            INSERT INTO file_action (id, file_id, action_id, created, is_active)
            VALUES (@Id, @FileId, @ActionId, @Created, @IsActive)
            ON CONFLICT (file_id, action_id) DO UPDATE SET
                is_active = @IsActive,
                deactivated = NULL";

        var link = new FileActionEntity
        {
            Id = Guid.NewGuid(),
            FileId = fileId,
            ActionId = actionId,
            Created = DateTimeOffset.UtcNow,
            IsActive = true
        };

        await connection.ExecuteAsync(sql, link);
    }

    /// <summary>
    /// Связать файл с задачей.
    /// </summary>
    public async Task LinkFileToTaskAsync(Guid fileId, Guid taskId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            INSERT INTO file_task (id, file_id, task_id, created, is_active)
            VALUES (@Id, @FileId, @TaskId, @Created, @IsActive)
            ON CONFLICT (file_id, task_id) DO UPDATE SET
                is_active = @IsActive,
                deactivated = NULL";

        var link = new FileTaskEntity
        {
            Id = Guid.NewGuid(),
            FileId = fileId,
            TaskId = taskId,
            Created = DateTimeOffset.UtcNow,
            IsActive = true
        };

        await connection.ExecuteAsync(sql, link);
    }

    /// <summary>
    /// Связать файл с областью.
    /// </summary>
    public async Task LinkFileToAreaAsync(Guid fileId, Guid areaId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            INSERT INTO file_area (id, file_id, area_id, created, is_active)
            VALUES (@Id, @FileId, @AreaId, @Created, @IsActive)
            ON CONFLICT (file_id, area_id) DO UPDATE SET
                is_active = @IsActive,
                deactivated = NULL";

        var link = new FileAreaEntity
        {
            Id = Guid.NewGuid(),
            FileId = fileId,
            AreaId = areaId,
            Created = DateTimeOffset.UtcNow,
            IsActive = true
        };

        await connection.ExecuteAsync(sql, link);
    }

    /// <summary>
    /// Отвязать файл от действия.
    /// </summary>
    public async Task UnlinkFileFromActionAsync(Guid fileId, Guid actionId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            UPDATE file_action 
            SET is_active = false, deactivated = @Deactivated
            WHERE file_id = @FileId AND action_id = @ActionId AND is_active = true";

        await connection.ExecuteAsync(sql, new 
        { 
            FileId = fileId, 
            ActionId = actionId, 
            Deactivated = DateTimeOffset.UtcNow 
        });
    }

    /// <summary>
    /// Отвязать файл от задачи.
    /// </summary>
    public async Task UnlinkFileFromTaskAsync(Guid fileId, Guid taskId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            UPDATE file_task 
            SET is_active = false, deactivated = @Deactivated
            WHERE file_id = @FileId AND task_id = @TaskId AND is_active = true";

        await connection.ExecuteAsync(sql, new 
        { 
            FileId = fileId, 
            TaskId = taskId, 
            Deactivated = DateTimeOffset.UtcNow 
        });
    }

    /// <summary>
    /// Отвязать файл от области.
    /// </summary>
    public async Task UnlinkFileFromAreaAsync(Guid fileId, Guid areaId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            UPDATE file_area 
            SET is_active = false, deactivated = @Deactivated
            WHERE file_id = @FileId AND area_id = @AreaId AND is_active = true";

        await connection.ExecuteAsync(sql, new 
        { 
            FileId = fileId, 
            AreaId = areaId, 
            Deactivated = DateTimeOffset.UtcNow 
        });
    }

    /// <summary>
    /// Получить все файлы действия.
    /// </summary>
    public async Task<IEnumerable<FileEntity>> GetFilesForActionAsync(Guid actionId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            SELECT f.id, f.filename, f.mime_type, f.byte_size, f.storage_url, 
                   f.user_id, f.created, f.is_active, f.deactivated
            FROM files f
            INNER JOIN file_action fa ON f.id = fa.file_id AND fa.is_active
            WHERE fa.action_id = @ActionId AND f.is_active = true
            ORDER BY f.created DESC";

        return await connection.QueryAsync<FileEntity>(sql, new { ActionId = actionId });
    }

    /// <summary>
    /// Получить все файлы задачи.
    /// </summary>
    public async Task<IEnumerable<FileEntity>> GetFilesForTaskAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            SELECT f.id, f.filename, f.mime_type, f.byte_size, f.storage_url, 
                   f.user_id, f.created, f.is_active, f.deactivated
            FROM files f
            INNER JOIN file_task ft ON f.id = ft.file_id AND ft.is_active
            WHERE ft.task_id = @TaskId AND f.is_active = true
            ORDER BY f.created DESC";

        return await connection.QueryAsync<FileEntity>(sql, new { TaskId = taskId });
    }

    /// <summary>
    /// Получить все файлы области.
    /// </summary>
    public async Task<IEnumerable<FileEntity>> GetFilesForAreaAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            SELECT f.id, f.filename, f.mime_type, f.byte_size, f.storage_url, 
                   f.user_id, f.created, f.is_active, f.deactivated
            FROM files f
            INNER JOIN file_area fa ON f.id = fa.file_id AND fa.is_active
            WHERE fa.area_id = @AreaId AND f.is_active = true
            ORDER BY f.created DESC";

        return await connection.QueryAsync<FileEntity>(sql, new { AreaId = areaId });
    }

    /// <summary>
    /// Получить статистику по файлам в области.
    /// </summary>
    public async Task<FileAreaStatistics> GetFileAreaStatisticsAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            SELECT 
                COUNT(DISTINCT f.id) as total_files,
                COALESCE(SUM(f.byte_size), 0) as total_size_bytes,
                COUNT(DISTINCT f.user_id) as unique_uploaders
            FROM files f
            INNER JOIN file_area fa ON f.id = fa.file_id AND fa.is_active
            WHERE fa.area_id = @AreaId AND f.is_active = true";

        var result = await connection.QueryFirstOrDefaultAsync(sql, new { AreaId = areaId });
        
        return new FileAreaStatistics
        {
            AreaId = areaId,
            TotalFiles = result?.total_files ?? 0,
            TotalSizeBytes = result?.total_size_bytes ?? 0,
            UniqueUploaders = result?.unique_uploaders ?? 0
        };
    }
}

/// <summary>
/// Статистика по файлам в области.
/// </summary>
public class FileAreaStatistics
{
    public Guid AreaId { get; set; }
    public int TotalFiles { get; set; }
    public long TotalSizeBytes { get; set; }
    public int UniqueUploaders { get; set; }
}
