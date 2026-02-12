using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Interfaces.Services;

/// <summary>
/// Сервис управления участниками области
/// </summary>
public interface IAreaMemberService
{
    /// <summary>
    /// Получить список участников области
    /// </summary>
    Task<IReadOnlyList<AreaMemberResponse>> GetMembersAsync(Guid areaId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Назначить роль участнику области
    /// </summary>
    Task AddMemberAsync(Guid areaId, AddAreaMemberRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Удалить участника из области
    /// </summary>
    Task RemoveMemberAsync(Guid areaId, Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Передать роль владельца другому пользователю
    /// </summary>
    Task TransferOwnerAsync(Guid areaId, TransferOwnerRequest request, CancellationToken cancellationToken = default);
}
