namespace TaskerApi.Models.Common.SqlFilters;

/// <summary>
/// SQL фильтр для строковых значений с поддержкой точного и нечеткого поиска.
/// </summary>
/// <param name="column">Информация о колонке</param>
/// <param name="value">Строковое значение для фильтрации</param>
/// <param name="isStrict">Флаг строгого поиска (true - точное совпадение, false - нечеткий поиск)</param>
/// <param name="srcAlias">Алиас источника данных</param>
/// <param name="isExclude">Флаг исключения (true - исключить, false - включить)</param>
public class StringFilter(
    ColumnMetaInfo column,
    string? value,
    bool isStrict = true,
    string? srcAlias = null,
    bool isExclude = false) : BaseFilter(column, srcAlias, isExclude)
{
    /// <summary>
    /// Генерирует SQL фильтр для строкового значения.
    /// </summary>
    /// <returns>Кортеж с SQL фильтром и параметрами</returns>
    public override (string filter, (string name, object? value)? param) GetSql()
    {
        if (value == null)
            return (GetSqlByNullFilter(), null);
        
        var paramName = $"{ParamPrefix}{column.DbName}_{Guid.NewGuid():N}";

        string sqlOperator;
        string formattedValue;
        if (isStrict)
        {
            formattedValue = value;
            sqlOperator = $"=";
        }
        else
        {
            formattedValue = $"%{value}%";
            sqlOperator = $"like";
        }

        var filter = $"{SrcAlias}{column.DbName} {sqlOperator} @{paramName}";
        return (filter, (paramName, formattedValue));
    }
}