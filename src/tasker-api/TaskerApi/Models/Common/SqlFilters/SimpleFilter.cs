namespace TaskerApi.Models.Common.SqlFilters;

public class SimpleFilter<T>(
    string fieldName, 
    T? value,
    bool isExclude = false) 
    : BaseFilter(fieldName, isExclude)
{
    public override (string filter, (string name, object? value)? param) GetSql()
    {
        if (value == null)
            return (GetSqlByNullFilter(), null);

        string sqlOperator = isExclude 
            ? "<>" 
            : "=";
        
        var paramName = $"{fieldName}_{Guid.NewGuid():N}";
        var filter = $"{fieldName} {sqlOperator} @{paramName}::{TypeMappingHelper.GetPostgresTypeName(typeof(T))}";

        return (filter, (paramName, value));
    }
}