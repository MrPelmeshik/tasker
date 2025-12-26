using TaskerApi.Models.Responses;

namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ с группой и задачей по умолчанию
/// </summary>
public class GroupWithTaskResponse
{
    public GroupResponse Group { get; set; } = null!;
    public TaskResponse DefaultTask { get; set; } = null!;
}
