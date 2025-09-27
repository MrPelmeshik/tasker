namespace TaskerApi.Models.Common.SqlFilters;

public class ArraySqlFilter<T>(
    ColumnMetaInfo column, 
    T[]? value, 
    string? srcAlias = null,
    bool isExclude = false) : BaseFilter(column, srcAlias, isExclude)
{
    public override (string filter, (string name, object? value)? param) GetSql()
    {
        if (value == null || value.Length == 0)
            return (GetSqlByNullFilter(), null);
        
        var paramName = $"{ParamPrefix}{column.DbName}_{Guid.NewGuid():N}";
        var filter = $"{SrcAlias}{column.DbName} {(isExclude ? "!= any" : "= any")} (@{paramName}::{TypeMappingHelper.GetPostgresTypeName(column.Property.PropertyType)}[])";
        return (filter, (paramName, value));
    }
}