using System.Data;
using Dapper;
using Microsoft.Extensions.Logging;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

/// <summary>
/// Реализация провайдера для tasks на базе Dapper.
/// </summary>
public class TaskProvider(ILogger<TaskProvider> logger) : BaseProvider(logger), ITaskProvider
{
    /// <inheritdoc />
    public async Task<TaskEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken, IDbConnection connection)
    {
        const string sql = $"""
                                        SELECT 
                                            id AS {nameof(TaskEntity.Id)}, 
                                            area_id AS {nameof(TaskEntity.AreaId)}, 
                                            title AS {nameof(TaskEntity.Title)}, 
                                            description AS {nameof(TaskEntity.Description)}, 
                                            status_id AS {nameof(TaskEntity.StatusId)},
                                            visibility_id AS {nameof(TaskEntity.VisibilityId)}, 
                                            user_id AS {nameof(TaskEntity.UserId)}, 
                                            created AS {nameof(TaskEntity.Created)}, 
                                            updated AS {nameof(TaskEntity.Updated)}, 
                                            closed AS {nameof(TaskEntity.Closed)},
                                            is_active AS {nameof(TaskEntity.IsActive)}, 
                                            deactivated AS {nameof(TaskEntity.Deactivated)}
                                        FROM tasks 
                                        WHERE id = @{nameof(TaskEntity.Id)};
                            """;
        EnsureValidConnection(connection);
        return await connection.QueryFirstOrDefaultAsync<TaskEntity>(
            new CommandDefinition(
                sql, 
                new { Id = id }, 
                cancellationToken: cancellationToken
            )
        );
    }

    /// <inheritdoc />
    public async Task<Guid> InsertAsync(TaskEntity entity, CancellationToken cancellationToken, IDbConnection connection)
    {
        const string sql = $"""
                                        INSERT INTO tasks (
                                            id, 
                                            area_id, 
                                            title, 
                                            description, 
                                            status_id, 
                                            visibility_id, 
                                            user_id, 
                                            created, 
                                            updated, 
                                            is_active
                                        )
                                        VALUES (
                                            @{nameof(TaskEntity.Id)}, 
                                            @{nameof(TaskEntity.AreaId)}, 
                                            @{nameof(TaskEntity.Title)}, 
                                            @{nameof(TaskEntity.Description)}, 
                                            @{nameof(TaskEntity.StatusId)}, 
                                            @{nameof(TaskEntity.VisibilityId)}, 
                                            @{nameof(TaskEntity.UserId)}, 
                                            @{nameof(TaskEntity.Created)}, 
                                            @{nameof(TaskEntity.Updated)}, 
                                            @{nameof(TaskEntity.IsActive)}
                                        )
                                        RETURNING id;
                            """;
        entity.Id = entity.Id == Guid.Empty ? Guid.NewGuid() : entity.Id;
        EnsureValidConnection(connection);
        var idTx = await connection.ExecuteScalarAsync<Guid>(
            new CommandDefinition(
                sql, 
                entity, 
                cancellationToken: cancellationToken
            )
        );
        Logger.LogInformation($"Создана задача {idTx}");
        return idTx;
    }

    /// <inheritdoc />
    public async Task<int> UpdateAsync(TaskEntity entity, CancellationToken cancellationToken, IDbConnection connection)
    {
        const string sql = $"""
                                        UPDATE tasks SET 
                                            title = @{nameof(TaskEntity.Title)}, 
                                            description = @{nameof(TaskEntity.Description)}, 
                                            status_id = @{nameof(TaskEntity.StatusId)}, 
                                            visibility_id = @{nameof(TaskEntity.VisibilityId)},
                                            is_active = @{nameof(TaskEntity.IsActive)},
                                            updated = @{nameof(TaskEntity.Updated)} 
                                        WHERE id = @{nameof(TaskEntity.Id)}
                            """;
        EnsureValidConnection(connection);
        var rowsTx = await connection.ExecuteAsync(
            new CommandDefinition(
                sql, 
                entity, 
                cancellationToken: cancellationToken
            )
        );
        Logger.LogInformation($"Обновлена задача {entity.Id}, затронуто строк: {rowsTx}");
        return rowsTx;
    }
}