using TaskerApi.Interfaces.Models.Common;

namespace TaskerApi.Models.Common.SqlFilters;

/// <summary>
/// Базовый фильтр
/// </summary>
/// <param name="fieldName"></param>
/// <param name="isExclude"></param>
public abstract class BaseFilter(string fieldName, bool isExclude = false) : IFilter
{
    public abstract (string filter, (string name, object? value)? param) GetSql();
    
    protected virtual string GetSqlByNullFilter()
    {
        return isExclude 
            ? $"{fieldName} is not null"
            : $"{fieldName} is null";
    }
}