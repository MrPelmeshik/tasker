using TaskerApi.Interfaces.Models.Common;

namespace TaskerApi.Models.Common.SqlFilters;

/// <summary>
/// Базовый фильтр
/// </summary>
/// <param name="column"></param>
/// <param name="isExclude"></param>
public abstract class BaseFilter(ColumnMetaInfo column, bool isExclude = false) : IFilter
{
    public abstract (string filter, (string name, object? value)? param) GetSql();
    
    protected virtual string GetSqlByNullFilter()
    {
        return isExclude 
            ? $"{column.DbName} is not null"
            : $"{column.DbName} is null";
    }
}