using Dapper;
using TaskerApi.Interfaces.Models.Common;
using TaskerApi.Interfaces.Models.Entities;
using TaskerApi.Models.Common;
using TaskerApi.Models.Common.SqlFilters;

namespace TaskerApi.Core;

/// <summary>
/// Статический класс для построения SQL запросов с поддержкой фильтрации, сортировки и пагинации
/// </summary>
public static class SqlConstructor
{
    /// <summary>
    /// Генерирует полный SQL запрос с WHERE, ORDER BY, LIMIT, OFFSET
    /// </summary>
    /// <param name="table">Метаинформация о таблице</param>
    /// <param name="filters">Список фильтров</param>
    /// <param name="withDeleted">Включить удаленные записи</param>
    /// <param name="orderColumn">Колонка для сортировки</param>
    /// <param name="orderDesc">Сортировка по убыванию</param>
    /// <param name="offset">Смещение</param>
    /// <param name="limit">Лимит</param>
    /// <param name="additionalFilters">Дополнительные фильтры</param>
    /// <returns>Кортеж с SQL запросом и параметрами</returns>
    public static (string sql, DynamicParameters parameters) BuildSelectQuery<T>(
        TableMetaInfo<T> table,
        IList<IFilter>? filters = null,
        bool withDeleted = false,
        string? orderColumn = null,
        bool orderDesc = false,
        int? offset = null,
        int? limit = null,
        IList<IFilter>? additionalFilters = null) where T : IDbEntity
    {
        var additionalFiltersList = new List<IFilter>();
        
        if (!withDeleted && table.HasSoftDelete) 
        {
            additionalFiltersList.Add(new SimpleFilter<bool>(table[nameof(ISoftDeleteBaseEntity.IsActive)], true));
        }

        if (additionalFilters is { Count: > 0 })
        {
            additionalFiltersList.AddRange(additionalFilters);
        }

        var (whereSql, parameters) = BuildWhereClause(filters, additionalFiltersList);

        var orderBy = !string.IsNullOrEmpty(orderColumn)
            ? $"\nORDER BY {table[orderColumn].DbName}" + (orderDesc ? " DESC" : " ASC")
            : string.Empty;
        
        var limitOffset = limit.HasValue
            ? $"\nLIMIT {limit.Value} OFFSET {offset ?? 0}"
            : string.Empty;
        
        var sql = $"""
                   SELECT {string.Join(", ", table.ColumnInfos.Select(c => $"{c.DbName} AS {c.SrcName}"))}
                   FROM {table.DbName}{whereSql}{orderBy}{limitOffset}
                   """;

        return (sql, parameters);
    }
    
    /// <summary>
    /// Генерирует WHERE-условия и параметры на основе фильтров
    /// </summary>
    /// <param name="filters">Список фильтров</param>
    /// <param name="additionalFilters">Дополнительные фильтры (например, по ID)</param>
    /// <returns>Кортеж с WHERE-условием и параметрами</returns>
    public static (string whereSql, DynamicParameters parameters) BuildWhereClause(
        IList<IFilter>? filters = null, 
        IList<IFilter>? additionalFilters = null)
    {
        var whereList = new List<string>();
        var parameters = new DynamicParameters();
        
        if (additionalFilters is { Count: > 0 })
        {
            var sqlFilters = additionalFilters.Select(filter => filter.GetSql()).ToArray();

            foreach (var sqlFilter in sqlFilters)
            {
                whereList.Add(sqlFilter.filter);
                
                if (sqlFilter.param.HasValue)
                    parameters.Add(sqlFilter.param.Value.name, sqlFilter.param.Value.value);
            }
        }

        if (filters is { Count: > 0 })
        {
            var sqlFilters = filters.Select(filter => filter.GetSql()).ToArray();

            foreach (var sqlFilter in sqlFilters)
            {
                whereList.Add(sqlFilter.filter);
                
                if (sqlFilter.param.HasValue)
                    parameters.Add(sqlFilter.param.Value.name, sqlFilter.param.Value.value);
            }
        }

        var whereSql = whereList.Count > 0 
            ? ("\nWHERE " + string.Join(" AND ", whereList)) 
            : string.Empty;

        return (whereSql, parameters);
    }

    /// <summary>
    /// Генерирует INSERT запрос
    /// </summary>
    /// <param name="table">Метаинформация о таблице</param>
    /// <param name="returningColumn">Колонка для возврата (обычно ID)</param>
    /// <returns>SQL запрос для INSERT</returns>
    public static string BuildInsertQuery<T>(
        TableMetaInfo<T> table, 
        ColumnMetaInfo? returningColumn = null) 
        where T : IDbEntity
    {
        var columns = string.Join(", ", table.NotReadOnlyDbColumnNames);
        var values = string.Join(", ", table.NotReadOnlyColumns.Select(c => 
            "@" + c.SrcName + "::" + TypeMappingHelper.GetPostgresTypeName(c.Property.PropertyType)));
        
        var returning = returningColumn is not null
            ? $"\nRETURNING {returningColumn.DbName}" 
            : string.Empty;
        
        return $"""
                INSERT INTO {table.DbName} ({columns})
                VALUES ({values}){returning}
                """;
    }

    /// <summary>
    /// Генерирует UPDATE запрос
    /// </summary>
    /// <param name="table">Метаинформация о таблице</param>
    /// <param name="filters">Фильтры для WHERE условия</param>
    /// <param name="additionalFilters">Дополнительные фильтры</param>
    /// <returns>Кортеж с SQL запросом и параметрами</returns>
    public static (string sql, DynamicParameters parameters) BuildUpdateQuery<T>(
        TableMetaInfo<T> table,
        IList<IFilter>? filters = null,
        IList<IFilter>? additionalFilters = null) 
        where T : IDbEntity
    {
        var (whereSql, parameters) = BuildWhereClause(filters, additionalFilters);
        
        var setSql = string.Join(", ", table.NotReadOnlyColumns.Select(c => 
            $"{c.DbName} = @{c.SrcName}::{TypeMappingHelper.GetPostgresTypeName(c.Property.PropertyType)}"));
        
        var sql = $"""
                   UPDATE {table.DbName} 
                   SET {setSql}{whereSql}
                   """;
        
        return (sql, parameters);
    }

    /// <summary>
    /// Генерирует DELETE запрос (с поддержкой мягкого удаления)
    /// </summary>
    /// <param name="table">Метаинформация о таблице</param>
    /// <param name="filters">Фильтры для WHERE условия</param>
    /// <param name="additionalFilters">Дополнительные фильтры</param>
    /// <returns>Кортеж с SQL запросом и параметрами</returns>
    public static (string sql, DynamicParameters parameters) BuildDeleteQuery<T>(
        TableMetaInfo<T> table,
        IList<IFilter>? filters = null,
        IList<IFilter>? additionalFilters = null) 
        where T : IDbEntity
    {
        var (whereSql, parameters) = BuildWhereClause(filters, additionalFilters);

        var sql = table.HasSoftDelete
            ? $"""
               UPDATE {table.DbName}
               SET {table[nameof(ISoftDeleteBaseEntity.IsActive)].DbName} = false
               ,   {table[nameof(ISoftDeleteBaseEntity.DeactivatedAt)].DbName} = now(){whereSql}
               """
            : $"""
               DELETE FROM {table.DbName}{whereSql}
               """;
        
        return (sql, parameters);
    }

    /// <summary>
    /// Генерирует COUNT запрос на основе запроса
    /// </summary>
    /// <param name="sql">SQL запрос</param>
    /// <param name="parameters">Параметры для запроса</param>
    /// <returns>Кортеж с SQL запросом COUNT и параметрами</returns>
    public static (string sql, DynamicParameters parameters) BuildCountQuery(
        string sql, 
        DynamicParameters parameters)
    {
        var countSql = $"SELECT COUNT(*) FROM ({sql}) AS count_query";
        return (countSql, parameters);
    }

    /// <summary>
    /// Объединяет несколько параметров в один
    /// </summary>
    /// <param name="pasrameters">Параметры</param>
    public static DynamicParameters CombineParameters(params DynamicParameters[] pasrameters)
    {
        var combinedParameters = new DynamicParameters();
        foreach (var parameter in pasrameters)
        {
            combinedParameters.AddDynamicParams(parameter);
        }
        return combinedParameters;
    }
}