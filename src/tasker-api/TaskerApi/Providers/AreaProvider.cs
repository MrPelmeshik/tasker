using System.Data;
using Dapper;
using Microsoft.Extensions.Logging;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Entities;

namespace TaskerApi.Providers;

/// <summary>
/// Реализация провайдера для areas на базе Dapper.
/// </summary>
public class AreaProvider(ILogger<AreaProvider> logger) : BaseProvider<AreaEntity, Guid>(logger), IAreaProvider
{
    /// <inheritdoc />
    public override async Task<AreaEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken, IDbConnection connection)
    {
        const string sql = $"""
                                        SELECT 
                                            id AS {nameof(AreaEntity.Id)}, 
                                            name AS {nameof(AreaEntity.Name)}, 
                                            description AS {nameof(AreaEntity.Description)}, 
                                            user_id AS {nameof(AreaEntity.UserId)}, 
                                            is_active AS {nameof(AreaEntity.IsActive)},
                                            deactivated AS {nameof(AreaEntity.Deactivated)}, 
                                            created AS {nameof(AreaEntity.Created)}, 
                                            updated AS {nameof(AreaEntity.Updated)}
                                        FROM areas 
                                        WHERE id = @{nameof(AreaEntity.Id)};
                            """;
        EnsureValidConnection(connection);
        return await connection.QueryFirstOrDefaultAsync<AreaEntity>(
            new CommandDefinition(
                sql, 
                new { Id = id }, 
                cancellationToken: cancellationToken
            )
        );
    }

    /// <inheritdoc />
    public override async Task<Guid> InsertAsync(AreaEntity entity, CancellationToken cancellationToken, IDbConnection connection)
    {
        const string sql = $"""
                                        INSERT INTO areas (
                                            id, 
                                            name, 
                                            description, 
                                            user_id, 
                                            is_active, 
                                            created, 
                                            updated
                                        )
                                        VALUES (
                                            @{nameof(AreaEntity.Id)}, 
                                            @{nameof(AreaEntity.Name)}, 
                                            @{nameof(AreaEntity.Description)}, 
                                            @{nameof(AreaEntity.UserId)}, 
                                            @{nameof(AreaEntity.IsActive)}, 
                                            @{nameof(AreaEntity.Created)}, 
                                            @{nameof(AreaEntity.Updated)}
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
        Logger.LogInformation($"Создана область {idTx}");
        return idTx;
    }

    /// <inheritdoc />
    public override async Task<int> UpdateAsync(AreaEntity entity, CancellationToken cancellationToken, IDbConnection connection)
    {
        const string sql = $"""
                                        UPDATE areas SET 
                                            name = @{nameof(AreaEntity.Name)}, 
                                            description = @{nameof(AreaEntity.Description)}, 
                                            is_active = @{nameof(AreaEntity.IsActive)},
                                            updated = @{nameof(AreaEntity.Updated)} 
                                        WHERE id = @{nameof(AreaEntity.Id)}
                            """;
        EnsureValidConnection(connection);
        var rowsTx = await connection.ExecuteAsync(
            new CommandDefinition(
                sql, 
                entity, 
                cancellationToken: cancellationToken
            )
        );
        Logger.LogInformation($"Обновлена область {entity.Id}, затронуто строк: {rowsTx}");
        return rowsTx;
    }
}
