namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на передачу роли владельца области
/// </summary>
public class TransferOwnerRequest
{
    /// <summary>
    /// Идентификатор пользователя, который станет новым владельцем
    /// </summary>
    public Guid NewOwnerUserId { get; set; }
}
