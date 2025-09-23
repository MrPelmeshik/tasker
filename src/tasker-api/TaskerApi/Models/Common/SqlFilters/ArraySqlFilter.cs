namespace TaskerApi.Models.Common.SqlFilters;

public class ArraySqlFilter<T>(
    string fieldName, 
    T[]? value, 
    bool isExclude = false) : BaseFilter(fieldName, isExclude)
{
    public override (string filter, (string name, object? value)? param) GetSql()
    {
        if (value == null || value.Length == 0)
            return (GetSqlByNullFilter(), null);
        
        var paramName = $"{fieldName}_{Guid.NewGuid():N}";
        var filter = $"{fieldName} {(isExclude ? "not in" : "in")} @{paramName}::{TypeMappingHelper.GetPostgresTypeName(typeof(T))}[]";
        return (filter, (paramName, value));
    }
}