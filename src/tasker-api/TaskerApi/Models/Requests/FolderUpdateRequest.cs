using System.ComponentModel.DataAnnotations;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на обновление папки
/// </summary>
public class FolderUpdateRequest
{
    /// <summary>
    /// Заголовок папки
    /// </summary>
    [Required(ErrorMessage = "Заголовок папки обязателен")]
    [StringLength(255, ErrorMessage = "Заголовок папки не может быть длиннее 255 символов")]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Описание папки
    /// </summary>
    [StringLength(10000, ErrorMessage = "Описание папки не может быть длиннее 10000 символов")]
    public string? Description { get; set; }

    /// <summary>
    /// Идентификатор области
    /// </summary>
    [Required(ErrorMessage = "Идентификатор области обязателен")]
    public Guid AreaId { get; set; }

    /// <summary>
    /// Идентификатор родительской папки (null = корень области)
    /// </summary>
    public Guid? ParentFolderId { get; set; }
}
