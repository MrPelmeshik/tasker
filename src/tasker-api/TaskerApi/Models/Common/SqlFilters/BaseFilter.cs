using TaskerApi.Interfaces.Models.Common;

namespace TaskerApi.Models.Common.SqlFilters;

/// <summary>
/// Базовый класс для SQL фильтров.
/// </summary>
/// <param name="column">Информация о колонке</param>
/// <param name="srcAlias">Алиас источника данных</param>
/// <param name="isExclude">Флаг исключения (true - исключить, false - включить)</param>
public abstract class BaseFilter(ColumnMetaInfo column, string? srcAlias = null, bool isExclude = false) : IFilter
{
    /// <summary>
    /// Генерирует SQL фильтр и параметры.
    /// </summary>
    /// <returns>Кортеж с SQL фильтром и параметрами</returns>
    public abstract (string filter, (string name, object? value)? param) GetSql();
    
    /// <summary>
    /// Получает алиас источника данных.
    /// </summary>
    protected string SrcAlias => string.IsNullOrEmpty(srcAlias) ? "" : $"{srcAlias}.";
    
    /// <summary>
    /// Получает префикс для параметров.
    /// </summary>
    protected string ParamPrefix => string.IsNullOrEmpty(srcAlias) ? "" : $"{srcAlias}_";
    
    /// <summary>
    /// Генерирует SQL фильтр для null значений.
    /// </summary>
    /// <returns>SQL фильтр для null значений</returns>
    protected virtual string GetSqlByNullFilter()
    {
        return isExclude 
            ? $"{SrcAlias}{column.DbName} is not null"
            : $"{SrcAlias}{column.DbName} is null";
    }
}