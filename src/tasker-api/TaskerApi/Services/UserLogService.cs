using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Services.Mapping;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для работы с логами пользователей с использованием Entity Framework
/// </summary>
public class UserLogService(
    ILogger<UserLogService> logger,
    IUserLogRepository userLogRepository,
    TaskerDbContext context)
    : IUserLogService
{
    /// <summary>
    /// Получить все логи пользователей
    /// </summary>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Список всех логов</returns>
    public async Task<IEnumerable<UserLogResponse>> GetAsync(CancellationToken cancellationToken)
    {
        try
        {
            var userLogs = await userLogRepository.GetAllAsync(cancellationToken);

            return userLogs.Select(ul => ul.ToUserLogResponse());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка получения логов пользователей");
            throw;
        }
    }

    /// <summary>
    /// Получить лог пользователя по идентификатору
    /// </summary>
    /// <param name="id">Идентификатор лога</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Лог или null, если не найден</returns>
    public async Task<UserLogResponse?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        try
        {
            var userLog = await userLogRepository.GetByIdAsync(id, cancellationToken);
            if (userLog == null)
            {
                return null;
            }

            return userLog.ToUserLogResponse();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка получения лога пользователя по идентификатору {UserLogId}", id);
            throw;
        }
    }

    /// <summary>
    /// Создать новый лог пользователя
    /// </summary>
    /// <param name="request">Данные для создания лога</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Созданный лог</returns>
    public async Task<UserLogResponse> CreateAsync(UserLogCreateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var userLog = new UserLogEntity
            {
                UserId = request.UserId,
                HttpMethod = request.HttpMethod,
                Endpoint = request.Endpoint,
                IpAddress = request.IpAddress,
                UserAgent = request.UserAgent,
                RequestParams = request.RequestParams,
                ResponseCode = request.ResponseCode,
                ErrorMessage = request.ErrorMessage,
                CreatedAt = DateTimeOffset.UtcNow
            };

            var createdUserLog = await userLogRepository.CreateAsync(userLog, cancellationToken);

            return createdUserLog.ToUserLogResponse();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка создания лога пользователя");
            throw;
        }
    }

    /// <summary>
    /// Получить логи по идентификатору пользователя
    /// </summary>
    /// <param name="userId">Идентификатор пользователя</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Список логов пользователя</returns>
    public async Task<IEnumerable<UserLogResponse>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        try
        {
            var userLogs = await userLogRepository.GetByUserIdAsync(userId, cancellationToken);

            return userLogs.Select(ul => ul.ToUserLogResponse());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка получения логов пользователя по идентификатору пользователя {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Получить логи по эндпоинту
    /// </summary>
    /// <param name="endpoint">Эндпоинт</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <returns>Список логов по эндпоинту</returns>
    public async Task<IEnumerable<UserLogResponse>> GetByEndpointAsync(string endpoint, CancellationToken cancellationToken)
    {
        try
        {
            var userLogs = await userLogRepository.GetByEndpointAsync(endpoint, cancellationToken);

            return userLogs.Select(ul => ul.ToUserLogResponse());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка получения логов пользователей по эндпоинту {Endpoint}", endpoint);
            throw;
        }
    }

    /// <summary>
    /// Удалить лог пользователя
    /// </summary>
    /// <param name="id">Идентификатор лога</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    public async Task DeleteAsync(int id, CancellationToken cancellationToken)
    {
        try
        {
            var userLog = await userLogRepository.GetByIdAsync(id, cancellationToken);
            if (userLog == null)
            {
                throw new InvalidOperationException("Лог пользователя не найден");
            }

            await userLogRepository.DeleteAsync(id, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка удаления лога пользователя {UserLogId}", id);
            throw;
        }
    }
}