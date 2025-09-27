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
    public TableMetaInfo<TEntity> Table => table;

    public virtual async Task<TKey> CreateAsync(
        IDbConnection connection, 
        TEntity entity, 
        CancellationToken cancellationToken, 
        IDbTransaction? transaction = null,
        bool setDefaultValues = false)
    {
        var sql = SqlConstructor.BuildInsertQuery(Table, Table[nameof(IIdBaseEntity<TKey>.Id)]);

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

            if (Table.HasSoftDelete && entity is ISoftDeleteBaseEntity softDeleteEntity)
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
        var (sql, parameters) = SqlConstructor.BuildSelectQuery(
            Table,
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
        allFilters.Add(new SimpleFilter<TKey>(Table[nameof(IIdBaseEntity<TKey>.Id)], id));
        
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
            new SimpleFilter<TKey>(Table[nameof(IIdBaseEntity<TKey>.Id)], entity.Id)
        };

        var (sql, parameters) = SqlConstructor.BuildUpdateQuery(Table, filers, additionalFilters);
        
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
            new ArraySqlFilter<TKey>(Table[nameof(IIdBaseEntity<TKey>.Id)], ids.ToArray())
        };

        var (sql, parameters) = SqlConstructor.BuildDeleteQuery(Table, filers, additionalFilters);
        
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
        var (selectSql, parameters) = SqlConstructor.BuildSelectQuery(
            Table,
            filters: filers,
            withDeleted: withDeleted,
            orderColumn: orderColumn,
            orderDesc: orderDesc,
            offset: offset,
            limit: limit);
        
        var (countSql, countParameters) = SqlConstructor.BuildCountQuery(selectSql, parameters);

        var count = await connection.QuerySingleAsync<int>(new CommandDefinition(
            commandText: countSql,
            parameters: countParameters,
            transaction: transaction,
            cancellationToken: cancellationToken));
        
        return count;
    }
}



