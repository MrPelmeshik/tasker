using TaskerApi.Interfaces.Models.Common;

namespace TaskerApi.Models.Common.SqlFilters;

/// <summary>
/// Базовый фильтр
/// </summary>
/// <param name="column"></param>
/// <param name="isExclude"></param>
public abstract class BaseFilter(ColumnMetaInfo column, string? srcAlias = null, bool isExclude = false) : IFilter
{
    public abstract (string filter, (string name, object? value)? param) GetSql();
    
    protected string SrcAlias => string.IsNullOrEmpty(srcAlias) ? "" : $"{srcAlias}.";
    
    protected string ParamPrefix => string.IsNullOrEmpty(srcAlias) ? "" : $"{srcAlias}_";
    
    
    protected virtual string GetSqlByNullFilter()
    {
        return isExclude 
            ? $"{SrcAlias}{column.DbName} is not null"
            : $"{SrcAlias}{column.DbName} is null";
    }
}