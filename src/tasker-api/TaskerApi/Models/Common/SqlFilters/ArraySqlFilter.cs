namespace TaskerApi.Models.Common.SqlFilters;

/// <summary>
/// SQL фильтр для массивов значений.
/// </summary>
/// <typeparam name="T">Тип элементов массива</typeparam>
/// <param name="column">Информация о колонке</param>
/// <param name="value">Массив значений для фильтрации</param>
/// <param name="srcAlias">Алиас источника данных</param>
/// <param name="isExclude">Флаг исключения (true - исключить, false - включить)</param>
public class ArraySqlFilter<T>(
    ColumnMetaInfo column, 
    T[]? value, 
    string? srcAlias = null,
    bool isExclude = false) : BaseFilter(column, srcAlias, isExclude)
{
    /// <summary>
    /// Генерирует SQL фильтр для массива значений.
    /// </summary>
    /// <returns>Кортеж с SQL фильтром и параметрами</returns>
    public override (string filter, (string name, object? value)? param) GetSql()
    {
        if (value == null || value.Length == 0)
            return (GetSqlByNullFilter(), null);
        
        var paramName = $"{ParamPrefix}{column.DbName}_{Guid.NewGuid():N}";
        var filter = $"{SrcAlias}{column.DbName} {(isExclude ? "!= any" : "= any")} (@{paramName}::{TypeMappingHelper.GetPostgresTypeName(column.Property.PropertyType)}[])";
        return (filter, (paramName, value));
    }
}