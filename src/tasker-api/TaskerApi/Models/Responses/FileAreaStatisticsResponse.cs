namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ со статистикой по файлам области.
/// </summary>
public class FileAreaStatisticsResponse
{
    public Guid AreaId { get; set; }
    public int TotalFiles { get; set; }
    public long TotalSizeBytes { get; set; }
    public int UniqueUploaders { get; set; }
}
