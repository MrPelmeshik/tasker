namespace TaskerApi.Interfaces.Models.Common;

/// <summary>
/// Интерфейс фильтра
/// </summary>
public interface IFilter
{
    /// <summary>
    /// Получить SQL фильтр
    /// </summary>
    /// <returns></returns>
    (string filter, (string name, object? value)? param) GetSql();
}