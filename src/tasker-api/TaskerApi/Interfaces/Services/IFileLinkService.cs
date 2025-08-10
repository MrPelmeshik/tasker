using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Интерфейс сервиса для управления связями файлов с объектами системы.
/// </summary>
public interface IFileLinkService
{
    /// <summary>
    /// Связать файл с действием.
    /// </summary>
    Task LinkFileToActionAsync(Guid fileId, Guid actionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Связать файл с задачей.
    /// </summary>
    Task LinkFileToTaskAsync(Guid fileId, Guid taskId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Связать файл с областью.
    /// </summary>
    Task LinkFileToAreaAsync(Guid fileId, Guid areaId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Отвязать файл от действия.
    /// </summary>
    Task UnlinkFileFromActionAsync(Guid fileId, Guid actionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Отвязать файл от задачи.
    /// </summary>
    Task UnlinkFileFromTaskAsync(Guid fileId, Guid taskId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Отвязать файл от области.
    /// </summary>
    Task UnlinkFileFromAreaAsync(Guid fileId, Guid areaId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить все файлы действия.
    /// </summary>
    Task<IEnumerable<FileEntity>> GetFilesForActionAsync(Guid actionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить все файлы задачи.
    /// </summary>
    Task<IEnumerable<FileEntity>> GetFilesForTaskAsync(Guid taskId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить все файлы области.
    /// </summary>
    Task<IEnumerable<FileEntity>> GetFilesForAreaAsync(Guid areaId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить статистику по файлам в области.
    /// </summary>
    Task<FileAreaStatistics> GetFileAreaStatisticsAsync(Guid areaId, CancellationToken cancellationToken = default);
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
