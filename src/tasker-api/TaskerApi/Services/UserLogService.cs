using TaskerApi.Constants;
using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Services.Base;
using TaskerApi.Services.Mapping;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для работы с логами пользователей с использованием Entity Framework.
/// </summary>
public class UserLogService(
    ILogger<UserLogService> logger,
    IUserLogRepository userLogRepository,
    TaskerDbContext context)
    : BaseService(logger, null), IUserLogService
{
    public async Task<IEnumerable<UserLogResponse>> GetAsync(CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var userLogs = await userLogRepository.GetAllAsync(cancellationToken);
            return userLogs.Select(ul => ul.ToUserLogResponse());
        }, nameof(GetAsync));
    }

    public async Task<UserLogResponse?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var userLog = await userLogRepository.GetByIdAsync(id, cancellationToken);
            return userLog?.ToUserLogResponse();
        }, nameof(GetByIdAsync), new { id });
    }

    public async Task<UserLogResponse> CreateAsync(UserLogCreateRequest request, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var userLog = request.ToUserLogEntity(request.UserId ?? Guid.Empty);
            var createdUserLog = await userLogRepository.CreateAsync(userLog, cancellationToken);
            return createdUserLog.ToUserLogResponse();
        }, nameof(CreateAsync), request);
    }

    public async Task<IEnumerable<UserLogResponse>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var userLogs = await userLogRepository.GetByUserIdAsync(userId, cancellationToken);
            return userLogs.Select(ul => ul.ToUserLogResponse());
        }, nameof(GetByUserIdAsync), new { userId });
    }

    public async Task<IEnumerable<UserLogResponse>> GetByEndpointAsync(string endpoint, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var userLogs = await userLogRepository.GetByEndpointAsync(endpoint, cancellationToken);
            return userLogs.Select(ul => ul.ToUserLogResponse());
        }, nameof(GetByEndpointAsync), new { endpoint });
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken)
    {
        await ExecuteWithErrorHandling(async () =>
        {
            var userLog = await userLogRepository.GetByIdAsync(id, cancellationToken);
            if (userLog == null)
                throw new InvalidOperationException(ErrorMessages.UserLogNotFound);

            await userLogRepository.DeleteAsync(id, cancellationToken);
        }, nameof(DeleteAsync), new { id });
    }
}
