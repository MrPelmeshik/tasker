using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Entities;
using TaskerApi.Infrastructure;
using Microsoft.Extensions.Logging;
using System.Data;
using Dapper;

namespace TaskerApi.Providers;

public class RuleProvider : BaseProvider<RuleEntity, Guid>, IRuleProvider
{
    public RuleProvider(ILogger logger) : base(logger)
    {
    }

    public async Task<IEnumerable<RuleEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        // Этот метод должен быть переработан для использования UnitOfWork
        // Пока оставляем как есть, но нужно будет обновить
        throw new NotImplementedException("Метод GetByAreaAsync требует переработки для использования UnitOfWork");
    }

    public async Task<IEnumerable<RuleEntity>> GetEnabledAsync(CancellationToken cancellationToken = default)
    {
        // Этот метод должен быть переработан для использования UnitOfWork
        // Пока оставляем как есть, но нужно будет обновить
        throw new NotImplementedException("Метод GetEnabledAsync требует переработки для использования UnitOfWork");
    }

    public async Task<IEnumerable<RuleEntity>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        // Этот метод должен быть переработан для использования UnitOfWork
        // Пока оставляем как есть, но нужно будет обновить
        throw new NotImplementedException("Метод GetActiveAsync требует переработки для использования UnitOfWork");
    }

    public override async Task<RuleEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken, IDbConnection connection)
    {
        EnsureValidConnection(connection);
        
        var sql = @"
            SELECT id, area_id, name, is_enabled, criteria, action, created, updated, is_active, deactivated
            FROM rules 
            WHERE id = @Id AND is_active = true";
        
        return await connection.QueryFirstOrDefaultAsync<RuleEntity>(sql, new { Id = id });
    }

    public override async Task<Guid> InsertAsync(RuleEntity entity, CancellationToken cancellationToken, IDbConnection connection)
    {
        EnsureValidConnection(connection);
        
        var sql = @"
            INSERT INTO rules (id, area_id, name, is_enabled, criteria, action, created, updated, is_active, deactivated)
            VALUES (@Id, @AreaId, @Name, @IsEnabled, @Criteria, @Action, @Created, @Updated, @IsActive, @Deactivated)
            RETURNING id";
        
        return await connection.ExecuteScalarAsync<Guid>(sql, entity);
    }

    public override async Task<int> UpdateAsync(RuleEntity entity, CancellationToken cancellationToken, IDbConnection connection)
    {
        EnsureValidConnection(connection);
        
        var sql = @"
            UPDATE rules 
            SET area_id = @AreaId, name = @Name, is_enabled = @IsEnabled, criteria = @Criteria, 
                action = @Action, updated = @Updated, is_active = @IsActive, deactivated = @Deactivated
            WHERE id = @Id";
        
        return await connection.ExecuteAsync(sql, entity);
    }
}
