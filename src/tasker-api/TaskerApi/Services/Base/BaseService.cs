using TaskerApi.Constants;
using TaskerApi.Interfaces.Services;

namespace TaskerApi.Services.Base;

/// <summary>
/// Базовый сервис с общими паттернами для всех сервисов
/// </summary>
public abstract class BaseService(ILogger logger, ICurrentUserService currentUser)
{
    protected readonly ICurrentUserService CurrentUser = currentUser;
    protected readonly ILogger Logger = logger;

    /// <summary>Выполнить операцию с логированием ошибок и повторным выбросом.</summary>
    protected async Task<T> ExecuteWithErrorHandling<T>(
        Func<Task<T>> operation, 
        string operationName, 
        object? parameters = null)
    {
        try
        {
            return await operation();
        }
        catch (Exception ex)
        {
            var paramInfo = parameters != null ? $" с параметрами: {parameters}" : "";
            Logger.LogError(ex, "Ошибка в {OperationName}{ParamInfo}", operationName, paramInfo);
            throw;
        }
    }

    /// <summary>Выполнить операцию (void) с логированием ошибок.</summary>
    protected async Task ExecuteWithErrorHandling(
        Func<Task> operation, 
        string operationName, 
        object? parameters = null)
    {
        try
        {
            await operation();
        }
        catch (Exception ex)
        {
            var paramInfo = parameters != null ? $" с параметрами: {parameters}" : "";
            Logger.LogError(ex, "Ошибка в {OperationName}{ParamInfo}", operationName, paramInfo);
            throw;
        }
    }

    /// <summary>Проверить доступ к области; при отсутствии — UnauthorizedAccessException.</summary>
    protected void EnsureAccessToArea(Guid areaId)
    {
        if (!CurrentUser.HasAccessToArea(areaId))
        {
            throw new UnauthorizedAccessException(ErrorMessages.AccessAreaDenied);
        }
    }

}
