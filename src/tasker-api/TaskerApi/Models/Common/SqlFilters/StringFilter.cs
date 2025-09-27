namespace TaskerApi.Models.Common.SqlFilters;

public class StringFilter(
    ColumnMetaInfo column,
    string? value,
    bool isStrict = true,
    string? srcAlias = null,
    bool isExclude = false) : BaseFilter(column, srcAlias, isExclude)
{
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