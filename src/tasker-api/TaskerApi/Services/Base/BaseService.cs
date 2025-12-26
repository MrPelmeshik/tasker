using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;

namespace TaskerApi.Services.Base;

/// <summary>
/// Базовый сервис с общими паттернами для всех сервисов
/// </summary>
public abstract class BaseService(ILogger logger, ICurrentUserService currentUser)
{
    /// <summary>
    /// Сервис текущего пользователя
    /// </summary>
    protected readonly ICurrentUserService CurrentUser = currentUser;
    
    /// <summary>
    /// Логгер для записи событий
    /// </summary>
    protected readonly ILogger Logger = logger;

    /// <summary>
    /// Выполнить операцию с обработкой ошибок
    /// </summary>
    /// <typeparam name="T">Тип возвращаемого значения</typeparam>
    /// <param name="operation">Операция для выполнения</param>
    /// <param name="operationName">Название операции</param>
    /// <param name="parameters">Параметры операции</param>
    /// <returns>Результат операции</returns>
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

    /// <summary>
    /// Выполнить операцию с обработкой ошибок (void)
    /// </summary>
    /// <param name="operation">Операция для выполнения</param>
    /// <param name="operationName">Название операции</param>
    /// <param name="parameters">Параметры операции</param>
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

    /// <summary>
    /// Проверить доступ к области
    /// </summary>
    /// <param name="areaId">Идентификатор области</param>
    /// <exception cref="UnauthorizedAccessException">Выбрасывается при отсутствии доступа</exception>
    protected void EnsureAccessToArea(Guid areaId)
    {
        if (!CurrentUser.HasAccessToArea(areaId))
        {
            throw new UnauthorizedAccessException($"Доступ к области {areaId} запрещен");
        }
    }

    /// <summary>
    /// Проверить доступ к группе через область
    /// </summary>
    /// <param name="groupId">Идентификатор группы</param>
    /// <param name="groupRepository">Репозиторий групп</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <exception cref="InvalidOperationException">Выбрасывается если группа не найдена</exception>
    /// <exception cref="UnauthorizedAccessException">Выбрасывается при отсутствии доступа</exception>
    protected async Task EnsureAccessToGroupAsync(
        Guid groupId, 
        IGroupRepository groupRepository, 
        CancellationToken cancellationToken)
    {
        var group = await groupRepository.GetByIdAsync(groupId, cancellationToken);
        if (group == null)
        {
            throw new InvalidOperationException($"Группа {groupId} не найдена");
        }

        EnsureAccessToArea(group.AreaId);
    }
}
