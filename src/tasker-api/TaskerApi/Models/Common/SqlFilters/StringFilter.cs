namespace TaskerApi.Models.Common.SqlFilters;

public class StringFilter(
    string fieldName,
    string? value,
    bool isStrict = true,
    bool isExclude = false) : BaseFilter(fieldName, isExclude)
{
    public override (string filter, (string name, object? value)? param) GetSql()
    {
        if (value == null)
            return (GetSqlByNullFilter(), null);
        
        var paramName = $"{fieldName}_{Guid.NewGuid():N}";

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

        var filter = $"{fieldName} {sqlOperator} @{paramName}";
        return (filter, (paramName, formattedValue));
    }
}