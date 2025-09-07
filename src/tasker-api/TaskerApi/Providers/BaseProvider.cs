using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using Dapper;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities.Contracts;

namespace TaskerApi.Providers;

/// <summary>
/// Базовый провайдер для сущностей
/// Ожидается, что сущности помечены атрибутом <see cref="TableAttribute"/> и реализуют <see cref="IIdBaseEntity"/>.
/// При наличии <see cref="ISoftDeleteBaseEntity"/> применяется мягкое удаление.
/// </summary>
public class BaseProvider<TEntity, TKey>(ILogger<BaseProvider<TEntity, TKey>> logger, TableMetaInfo<TEntity> table) 
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
                   VALUES ({string.Join(", ", table.NotReadOnlySrcColumnNames.Select(c => "@" + c))})
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

    public virtual async Task<TEntity?> GetByIdAsync(
        IDbConnection connection,
        TKey id,
        CancellationToken cancellationToken,
        IDbTransaction? transaction = null)
    {
        var sql = $"""
                   SELECT {string.Join(", ", table.ColumnInfos.Select(c => $"{c.DbName} as {c.SrcName}"))}
                   FROM {table.DbName} 
                   WHERE {table[nameof(IIdBaseEntity<TKey>.Id)].DbName} = @{nameof(id)} 
                   order by {table[nameof(IIdBaseEntity<TKey>.Id)].DbName}
                   LIMIT 1
                   """;

        var entity = await connection.QueryFirstOrDefaultAsync<TEntity>(new CommandDefinition(
            commandText: sql,
            parameters: new { id },
            transaction: transaction,
            cancellationToken: cancellationToken));

        return entity;
    }

    public virtual async Task<IReadOnlyList<TEntity>> GetListAsync(
        IDbConnection connection, 
        CancellationToken cancellationToken, 
        int? offset = null, 
        int? limit = null, 
        string? search = null, 
        IDbTransaction? transaction = null)
    {
        var whereList = new List<string>();
        
        if (table.HasSoftDelete) 
            whereList.Add($"{table[nameof(ISoftDeleteBaseEntity.IsActive)].DbName} = true");
        
        if (!string.IsNullOrWhiteSpace(search))
        {
            var textColumns = table
                .ColumnInfos
                .Where(c => c.Property.PropertyType == typeof(string))
                .Select(p => p.DbName)
                .ToArray();

            if (textColumns.Length > 0)
            {
                var likeExpr = string.Join(" OR ", textColumns.Select(c => $"{c} ILIKE @q"));
                whereList.Add($"({likeExpr})");
            }
        }
        
        var limitOffset = string.Empty;
        if (limit.HasValue && offset.HasValue)
            limitOffset = $"\nOFFSET {offset.Value} LIMIT {limit.Value}";

        var whereSql = whereList.Count > 0 
            ? ("\nWHERE " + string.Join(" AND ", whereList)) 
            : string.Empty;
        var sql = $"""
                   SELECT {string.Join(", ", table.ColumnInfos.Select(c => $"{c.DbName} as {c.SrcName}"))}
                   FROM {table.DbName}{whereSql} 
                   ORDER BY {table[nameof(IIdBaseEntity<TKey>.Id)].DbName}{limitOffset}
                   """;
        
        var rows = await connection.QueryAsync<TEntity>(new CommandDefinition(
            commandText: sql, 
            parameters: new
            {
                offset, 
                limit, 
                q = "%" + search + "%"
            }, 
            transaction: transaction, 
            cancellationToken: cancellationToken));
        
        return rows.ToList();
    }

    public virtual async Task<int> UpdateAsync(
        IDbConnection connection,
        TEntity entity,
        CancellationToken cancellationToken,
        IDbTransaction? transaction = null,
        bool setDefaultValues = false)
    {
        var setSql = string.Join(", ", table.NotReadOnlyColumns.Select(c => $"{c.DbName} = @{c.SrcName}"));
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



