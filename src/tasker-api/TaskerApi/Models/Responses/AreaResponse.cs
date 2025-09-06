namespace TaskerApi.Models.Responses;

public class AreaResponse
{
    /// <summary>
    /// Заголовок области
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Описание области
    /// </summary>
    public string? Description { get; set; }

    public Guid CreatorUserId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public Guid Id { get; set; }

    public DateTimeOffset? DeactivatedAt { get; set; }

    public bool IsActive { get; set; }


    public DateTimeOffset UpdatedAt { get; set; }
}