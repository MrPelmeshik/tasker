namespace TaskerApi.Core.Interfaces;

/// <summary>
/// Фабрика для создания единиц работы.
/// </summary>
public interface IUnitOfWorkFactory
{
    /// <summary>
    /// Создать Unit of Work. Если <paramref name="useTransaction"/> истина — начать транзакцию.
    /// </summary>
    Task<IUnitOfWork> CreateAsync(CancellationToken cancellationToken, bool useTransaction = false);
}