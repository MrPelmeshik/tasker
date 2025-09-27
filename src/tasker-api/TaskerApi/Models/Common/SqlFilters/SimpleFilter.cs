namespace TaskerApi.Models.Common.SqlFilters;

public class SimpleFilter<T>(
    ColumnMetaInfo column, 
    T? value,
    string? srcAlias = null,
    bool isExclude = false) 
    : BaseFilter(column, srcAlias, isExclude)
{
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