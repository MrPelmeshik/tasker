namespace TaskerApi.Models.Common.SqlFilters;

/// <summary>
/// Простой SQL фильтр для одиночных значений.
/// </summary>
/// <typeparam name="T">Тип значения для фильтрации</typeparam>
/// <param name="column">Информация о колонке</param>
/// <param name="value">Значение для фильтрации</param>
/// <param name="srcAlias">Алиас источника данных</param>
/// <param name="isExclude">Флаг исключения (true - исключить, false - включить)</param>
public class SimpleFilter<T>(
    ColumnMetaInfo column, 
    T? value,
    string? srcAlias = null,
    bool isExclude = false) 
    : BaseFilter(column, srcAlias, isExclude)
{
    /// <summary>
    /// Генерирует SQL фильтр для одиночного значения.
    /// </summary>
    /// <returns>Кортеж с SQL фильтром и параметрами</returns>
    public override (string filter, (string name, object? value)? param) GetSql()
    {
        if (value == null)
            return (GetSqlByNullFilter(), null);

        string sqlOperator = isExclude 
            ? "<>" 
            : "=";
        
        var paramName = $"{ParamPrefix}{column.DbName}_{Guid.NewGuid():N}";
        var filter = $"{SrcAlias}{column.DbName} {sqlOperator} @{paramName}::{TypeMappingHelper.GetPostgresTypeName(column.Property.PropertyType)}";

        return (filter, (paramName, value));
    }
}