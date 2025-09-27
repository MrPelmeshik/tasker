namespace TaskerApi.Models.Common.SqlFilters;

public class ArraySqlFilter<T>(
    ColumnMetaInfo column, 
    T[]? value, 
    bool isExclude = false) : BaseFilter(column, isExclude)
{
    public override (string filter, (string name, object? value)? param) GetSql()
    {
        if (value == null || value.Length == 0)
            return (GetSqlByNullFilter(), null);
        
        var paramName = $"{column.DbName}_{Guid.NewGuid():N}";
        var filter = $"{column.DbName} {(isExclude ? "!= any" : "= any")} (@{paramName}::{TypeMappingHelper.GetPostgresTypeName(column.Property.PropertyType)}[])";
        return (filter, (paramName, value));
    }
}