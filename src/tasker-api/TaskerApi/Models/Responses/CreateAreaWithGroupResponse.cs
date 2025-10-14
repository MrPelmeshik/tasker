namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ на создание области с группой по умолчанию.
/// </summary>
public class CreateAreaWithGroupResponse
{
    /// <summary>
    /// Информация о созданной области.
    /// </summary>
    public AreaResponse Area { get; set; } = new();
    
    /// <summary>
    /// Информация о группе по умолчанию.
    /// </summary>
    public GroupResponse DefaultGroup { get; set; } = new();
}
