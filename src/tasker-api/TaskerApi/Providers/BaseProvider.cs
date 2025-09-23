using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Reflection;
using Dapper;
using TaskerApi.Core;
using TaskerApi.Interfaces.Models.Common;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Common.SqlFilters;
using TaskerApi.Models.Entities.Contracts;

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
    public virtual async Task<TKey> CreateAsync(
        IDbConnection connection, 
        TEntity entity, 
        CancellationToken cancellationToken, 
        IDbTransaction? transaction = null,
        bool setDefaultValues = false)
    {
        var sql = $"""
                   INSERT INTO {table.DbName} ({string.Join(", ", table.NotReadOnlyDbColumnNames)})
                   VALUES ({string.Join(", ", table.NotReadOnlyColumns.Select(c => "@" + c.SrcName + "::" + TypeMappingHelper.GetPostgreSqlTypeName(c.Property.PropertyType)))})
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
        var whereList = new List<string>();
        var parameters = new DynamicParameters();
        
        if (!withDeleted && table.HasSoftDelete) 
            whereList.Add($"{table[nameof(ISoftDeleteBaseEntity.IsActive)].DbName} = true");

        if (filers is { Count: > 0 })
        {
            var sqlFilters = filers.Select(filter => filter.GetSql()).ToArray();

            foreach (var sqlFilter in sqlFilters)
            {
                whereList.Add(sqlFilter.filter);
                
                if (sqlFilter.param.HasValue)
                    parameters.Add(sqlFilter.param.Value.name, sqlFilter.param.Value.value);
            }
        }

        var orderBy = !string.IsNullOrEmpty(orderColumn)
            ? $"\nORDER BY {table[orderColumn].DbName}" + (orderDesc ? " DESC" : " ASC")
            : string.Empty;
        
        var limitOffset = limit.HasValue
            ? $"\nLIMIT {limit.Value} OFFSET {offset ?? 0}"
            : string.Empty;

        var whereSql = whereList.Count > 0 
            ? ("\nWHERE " + string.Join(" AND ", whereList)) 
            : string.Empty;
        
        var sql = $"""
                   SELECT {string.Join(", ", table.ColumnInfos.Select(c => $"{c.DbName} AS {c.SrcName}"))}
                   FROM {table.DbName}{whereSql}{orderBy}{limitOffset}
                   """;
        
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
        IDbTransaction? transaction = null)
    {
        return await GetSimpleAsync(
            connection, 
            cancellationToken, 
            filers: [new SimpleFilter(nameof(IIdBaseEntity<TKey>.Id), id)], 
            orderColumn: nameof(IIdBaseEntity<TKey>.Id),
            orderDesc: false,
            withDeleted: false,
            transaction: transaction);
    }

    public virtual async Task<int> UpdateAsync(
        IDbConnection connection,
        TEntity entity,
        CancellationToken cancellationToken,
        IDbTransaction? transaction = null,
        bool setDefaultValues = false)
    {
        var setSql = string.Join(", ", table.NotReadOnlyColumns.Select(c => $"{c.DbName} = {"@" + c.SrcName + "::" + TypeMappingHelper.GetPostgreSqlTypeName(c.Property.PropertyType)}"));
        var sql = $"""
                   UPDATE {table.DbName} 
                   SET {setSql} 
                   WHERE {table[nameof(IIdBaseEntity<TKey>.Id)].DbName} = @{nameof(entity.Id)}
                   """;
        
        if (setDefaultValues)
        {
            if (typeof(IUpdatedDateBaseEntity).IsAssignableFrom(typeof(TEntity))
                && entity is IUpdatedDateBaseEntity updatedEntity)
            {
                updatedEntity.UpdatedAt = DateTime.Now;
            }
        }
        
        var affected = await connection.ExecuteAsync(new CommandDefinition(
            commandText: sql,
            parameters: entity,
            transaction: transaction,
            cancellationToken: cancellationToken));

        return affected;
    }

    public virtual async Task<int> DeleteAsync(
        IDbConnection connection, 
        TKey id, 
        CancellationToken cancellationToken, 
        IDbTransaction? transaction = null)
    {
        var affected = await DeleteAsync(
            connection, 
            [id], 
            cancellationToken, 
            transaction);
        return affected;
    }
    
    public virtual async Task<int> DeleteAsync(
        IDbConnection connection, 
        IList<TKey> ids, 
        CancellationToken cancellationToken, 
        IDbTransaction? transaction = null)
    {
        var sql = table.HasSoftDelete
            ? $"""
               update {table.DbName}
               set {table[nameof(ISoftDeleteBaseEntity.IsActive)].DbName} = false
               ,   {table[nameof(ISoftDeleteBaseEntity.DeactivatedAt)].DbName} = now()
               where {table[nameof(IIdBaseEntity<TKey>.Id)].DbName} = any(@{nameof(ids)})
               """
            : $"""
               delete from {table.DbName} 
               where {table[nameof(IIdBaseEntity<TKey>.Id)].DbName} = any(@{nameof(ids)})
               """;
        
        var affected = await connection.ExecuteAsync(new CommandDefinition(sql, new { ids }, transaction, cancellationToken: cancellationToken));
        return affected;
    }
}



