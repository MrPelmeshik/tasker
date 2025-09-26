using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Reflection;
using Dapper;
using TaskerApi.Core;
using TaskerApi.Interfaces.Models.Common;
using TaskerApi.Interfaces.Models.Entities;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Common.SqlFilters;

namespace TaskerApi.Providers;

/// <summary>
/// Базовый провайдер для сущностей
/// Ожидается, что сущности помечены атрибутом <see cref="TableAttribute"/> и реализуют <see cref="IIdBaseEntity"/>.
/// При наличии <see cref="ISoftDeleteBaseEntity"/> применяется мягкое удаление.
/// </summary>
public class BaseProvider<TEntity, TKey>(
    ILogger<BaseProvider<TEntity, TKey>> logger, 
    TableMetaInfo<TEntity> table) 
    : IBaseProvider<TEntity, TKey>
    where TEntity : class, IIdBaseEntity<TKey>, IDbEntity
{
    /// <summary>
    /// Генерирует полный SQL запрос с WHERE, ORDER BY, LIMIT, OFFSET
    /// </summary>
    /// <param name="filters">Список фильтров</param>
    /// <param name="withDeleted">Включить удаленные записи</param>
    /// <param name="orderColumn">Колонка для сортировки</param>
    /// <param name="orderDesc">Сортировка по убыванию</param>
    /// <param name="offset">Смещение</param>
    /// <param name="limit">Лимит</param>
    /// <param name="additionalFilters">Дополнительные фильтры</param>
    /// <returns>Кортеж с SQL запросом и параметрами</returns>
    private (string sql, DynamicParameters parameters) BuildSelectQuery(
        IList<IFilter>? filters = null,
        bool withDeleted = false,
        string? orderColumn = null,
        bool orderDesc = false,
        int? offset = null,
        int? limit = null,
        IList<IFilter>? additionalFilters = null)
    {
        var additionalFiltersList = new List<IFilter>();
        
        if (!withDeleted && table.HasSoftDelete) 
        {
            additionalFiltersList.Add(new SimpleFilter<bool>(table[nameof(ISoftDeleteBaseEntity.IsActive)].DbName, true));
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
    private (string whereSql, DynamicParameters parameters) BuildWhereClause(
        IList<IFilter>? filters = null, 
        IList<IFilter>? additionalFilters = null)
    {
        var whereList = new List<string>();
        var parameters = new DynamicParameters();
        
        // Добавляем дополнительные фильтры (например, по ID)
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

        // Добавляем основные фильтры
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

    public virtual async Task<TKey> CreateAsync(
        IDbConnection connection, 
        TEntity entity, 
        CancellationToken cancellationToken, 
        IDbTransaction? transaction = null,
        bool setDefaultValues = false)
    {
        var sql = $"""
                   INSERT INTO {table.DbName} ({string.Join(", ", table.NotReadOnlyDbColumnNames)})
                   VALUES ({string.Join(", ", table.NotReadOnlyColumns.Select(c => "@" + c.SrcName + "::" + TypeMappingHelper.GetPostgresTypeName(c.Property.PropertyType)))})
                   RETURNING {table[nameof(IIdBaseEntity<TKey>.Id)].DbName}
                   """;

        if (setDefaultValues)
        {
            if (typeof(ICreatedDateBaseEntity).IsAssignableFrom(typeof(TEntity))
                && entity is ICreatedDateBaseEntity createdEntity)
            {
                createdEntity.CreatedAt = DateTime.Now;
            }

            if (typeof(IUpdatedDateBaseEntity).IsAssignableFrom(typeof(TEntity))
                && entity is IUpdatedDateBaseEntity updatedEntity)
            {
                updatedEntity.UpdatedAt = DateTime.Now;
            }

            if (table.HasSoftDelete && entity is ISoftDeleteBaseEntity softDeleteEntity)
            {
                softDeleteEntity.IsActive = true;
            }
            
        }

        var id = await connection.QueryFirstAsync<TKey>(new CommandDefinition(
                commandText: sql,
                parameters: entity,
                transaction: transaction,
                cancellationToken: cancellationToken));
        return id;
    }
    
    public virtual async Task<IList<TKey>> CreateAsync(
        IDbConnection connection, 
        IList<TEntity> entities, 
        CancellationToken cancellationToken,
        IDbTransaction? transaction = null, 
        bool setDefaultValues = false)
    {
        var ids = new List<TKey>();
        foreach (var entity in entities)
        {
            ids.Add(await CreateAsync(connection, entity, cancellationToken, transaction, setDefaultValues));
        }
        return ids;
    }
    
    public virtual async Task<IReadOnlyList<TEntity>> GetListAsync(
        IDbConnection connection, 
        CancellationToken cancellationToken, 
        IList<IFilter>? filers = null,
        bool withDeleted = false,
        string? orderColumn = null,
        bool orderDesc = false,
        int? offset = null, 
        int? limit = null, 
        IDbTransaction? transaction = null)
    {
        var (sql, parameters) = BuildSelectQuery(
            filters: filers,
            withDeleted: withDeleted,
            orderColumn: orderColumn,
            orderDesc: orderDesc,
            offset: offset,
            limit: limit);
        
        var rows = await connection.QueryAsync<TEntity>(new CommandDefinition(
            commandText: sql, 
            parameters: parameters, 
            transaction: transaction, 
            cancellationToken: cancellationToken));
        
        return rows.ToList();
    }

    public async Task<TEntity?> GetSimpleAsync(
        IDbConnection connection,
        CancellationToken cancellationToken,
        IList<IFilter>? filers = null,
        bool withDeleted = false,
        string? orderColumn = null,
        bool orderDesc = false,
        bool checkOnlyOne = false,
        IDbTransaction? transaction = null)
    {
        if (checkOnlyOne)
        {
            var result = await GetListAsync(
                connection,
                cancellationToken,
                filers: filers,
                orderColumn: orderColumn,
                orderDesc: orderDesc,
                withDeleted: withDeleted,
                transaction: transaction);

            return result.Count switch
            {
                > 1 => throw new Exception("Обнаружено более одного элемента с одинаковым id"),
                _ => result.FirstOrDefault()
            };
        }
        else
        {
            return (await GetListAsync(
                connection,
                cancellationToken,
                filers: filers,
                orderColumn: orderColumn,
                orderDesc: orderDesc,
                withDeleted: withDeleted,
                limit: 1,
                transaction: transaction
            )).FirstOrDefault();
        }
    }

    public async Task<TEntity?> GetByIdAsync(
        IDbConnection connection, 
        TKey id, 
        CancellationToken cancellationToken,
        IList<IFilter>? filers = null,
        IDbTransaction? transaction = null)
    {
        // Объединяем фильтры: сначала дополнительные (по ID), потом основные
        var allFilters = new List<IFilter>();
        
        // Добавляем фильтр по ID
        allFilters.Add(new SimpleFilter<TKey>(table[nameof(IIdBaseEntity<TKey>.Id)].DbName, id));
        
        // Добавляем дополнительные фильтры
        if (filers is { Count: > 0 })
        {
            allFilters.AddRange(filers);
        }

        return await GetSimpleAsync(
            connection, 
            cancellationToken, 
            filers: allFilters, 
            orderColumn: nameof(IIdBaseEntity<TKey>.Id),
            orderDesc: false,
            withDeleted: false,
            transaction: transaction);
    }

    public virtual async Task<int> UpdateAsync(
        IDbConnection connection,
        TEntity entity,
        CancellationToken cancellationToken,
        IList<IFilter>? filers = null,
        IDbTransaction? transaction = null,
        bool setDefaultValues = false)
    {
        // Создаем фильтр по ID
        var additionalFilters = new List<IFilter>
        {
            new SimpleFilter<TKey>(table[nameof(IIdBaseEntity<TKey>.Id)].DbName, entity.Id)
        };

        var (whereSql, parameters) = BuildWhereClause(filers, additionalFilters);

        var setSql = string.Join(", ", table.NotReadOnlyColumns.Select(c => $"{c.DbName} = {"@" + c.SrcName + "::" + TypeMappingHelper.GetPostgresTypeName(c.Property.PropertyType)}"));
        var sql = $"""
                   UPDATE {table.DbName} 
                   SET {setSql}{whereSql}
                   """;
        
        if (setDefaultValues)
        {
            if (typeof(IUpdatedDateBaseEntity).IsAssignableFrom(typeof(TEntity))
                && entity is IUpdatedDateBaseEntity updatedEntity)
            {
                updatedEntity.UpdatedAt = DateTime.Now;
            }
        }
        
        // Объединяем параметры entity с дополнительными параметрами фильтров
        var entityParams = new DynamicParameters(entity);
        foreach (var param in parameters.ParameterNames)
        {
            entityParams.Add(param, parameters.Get<object>(param));
        }
        
        var affected = await connection.ExecuteAsync(new CommandDefinition(
            commandText: sql,
            parameters: entityParams,
            transaction: transaction,
            cancellationToken: cancellationToken));

        return affected;
    }

    public virtual async Task<int> DeleteAsync(
        IDbConnection connection, 
        TKey id, 
        CancellationToken cancellationToken, 
        IList<IFilter>? filers = null,
        IDbTransaction? transaction = null)
    {
        var affected = await DeleteAsync(
            connection, 
            [id], 
            cancellationToken, 
            filers,
            transaction);
        return affected;
    }
    
    public virtual async Task<int> DeleteAsync(
        IDbConnection connection, 
        IList<TKey> ids, 
        CancellationToken cancellationToken, 
        IList<IFilter>? filers = null,
        IDbTransaction? transaction = null)
    {
        // Создаем фильтр по массиву ID
        var additionalFilters = new List<IFilter>
        {
            new ArraySqlFilter<TKey>(table[nameof(IIdBaseEntity<TKey>.Id)].DbName, ids.ToArray())
        };

        var (whereSql, parameters) = BuildWhereClause(filers, additionalFilters);

        var sql = table.HasSoftDelete
            ? $"""
               update {table.DbName}
               set {table[nameof(ISoftDeleteBaseEntity.IsActive)].DbName} = false
               ,   {table[nameof(ISoftDeleteBaseEntity.DeactivatedAt)].DbName} = now(){whereSql}
               """
            : $"""
               delete from {table.DbName}{whereSql}
               """;
        
        var affected = await connection.ExecuteAsync(new CommandDefinition(sql, parameters, transaction, cancellationToken: cancellationToken));
        return affected;
    }

    public async Task<int> GetCountAsync(
        IDbConnection connection,
        CancellationToken cancellationToken,
        IList<IFilter>? filers = null,
        bool withDeleted = false,
        string? orderColumn = null,
        bool orderDesc = false,
        int? offset = null,
        int? limit = null,
        IDbTransaction? transaction = null)
    {
        var (selectSql, parameters) = BuildSelectQuery(
            filters: filers,
            withDeleted: withDeleted,
            orderColumn: orderColumn,
            orderDesc: orderDesc,
            offset: offset,
            limit: limit);

        // Оборачиваем SELECT запрос в COUNT(*)
        var countSql = $"SELECT COUNT(*) FROM ({selectSql}) AS count_query";

        var count = await connection.QuerySingleAsync<int>(new CommandDefinition(
            commandText: countSql,
            parameters: parameters,
            transaction: transaction,
            cancellationToken: cancellationToken));
        
        return count;
    }
}



