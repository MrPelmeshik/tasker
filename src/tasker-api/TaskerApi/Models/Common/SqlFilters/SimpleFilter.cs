namespace TaskerApi.Models.Common.SqlFilters;

public class SimpleFilter<T>(
    ColumnMetaInfo column, 
    T? value,
    bool isExclude = false) 
    : BaseFilter(column, isExclude)
{
    public override (string filter, (string name, object? value)? param) GetSql()
    {
        if (value == null)
            return (GetSqlByNullFilter(), null);

        string sqlOperator = isExclude 
            ? "<>" 
            : "=";
        
        var paramName = $"{column.DbName}_{Guid.NewGuid():N}";
        var filter = $"{column.DbName} {sqlOperator} @{paramName}::{TypeMappingHelper.GetPostgresTypeName(column.Property.PropertyType)}";

        return (filter, (paramName, value));
    }
}