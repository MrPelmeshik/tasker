namespace TaskerApi.Models.Responses;

/// <summary>
/// Ответ с информацией об области и количеством групп.
/// </summary>
public class AreaWithGroupsCountResponse
{
    /// <summary>
    /// Уникальный идентификатор области.
    /// </summary>
    public Guid Id { get; set; }
    
    /// <summary>
    /// Заголовок области.
    /// </summary>
    public string Title { get; set; } = string.Empty;
    
    /// <summary>
    /// Описание области.
    /// </summary>
    public string? Description { get; set; }
    
    /// <summary>
    /// Количество групп в области.
    /// </summary>
    public int GroupsCount { get; set; }
}
