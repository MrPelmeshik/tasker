namespace TaskerApi.Models.Common.SqlFilters;

public class StringFilter(
    ColumnMetaInfo column,
    string? value,
    bool isStrict = true,
    bool isExclude = false) : BaseFilter(column, isExclude)
{
    public override (string filter, (string name, object? value)? param) GetSql()
    {
        if (value == null)
            return (GetSqlByNullFilter(), null);
        
        var paramName = $"{column.DbName}_{Guid.NewGuid():N}";

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

        var filter = $"{column.DbName} {sqlOperator} @{paramName}";
        return (filter, (paramName, formattedValue));
    }
}