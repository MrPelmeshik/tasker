using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Entities;
using TaskerApi.Infrastructure;
using System.Data;
using Dapper;
using Microsoft.Extensions.Logging;

namespace TaskerApi.Providers;

public class ActionProvider : BaseProvider<ActionEntity, Guid>, IActionProvider
{
    private readonly IUnitOfWorkFactory _unitOfWorkFactory;

    public ActionProvider(IUnitOfWorkFactory unitOfWorkFactory, ILogger<ActionProvider> logger) 
        : base(logger)
    {
        _unitOfWorkFactory = unitOfWorkFactory;
    }

    public override async Task<ActionEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken, IDbConnection connection)
    {
        const string sql = @"
            SELECT id, area_id, user_id, verb_id, summary, note, started, ended, duration_sec, 
                   visibility_id, context, is_active, deactivated, created, updated
            FROM actions 
            WHERE id = @Id AND is_active = true";
        
        EnsureValidConnection(connection);
        return await connection.QueryFirstOrDefaultAsync<ActionEntity>(sql, new { Id = id });
    }

    public override async Task<Guid> InsertAsync(ActionEntity entity, CancellationToken cancellationToken, IDbConnection connection)
    {
        const string sql = @"
            INSERT INTO actions (id, area_id, user_id, verb_id, summary, note, started, ended, 
                                duration_sec, visibility_id, context, is_active, created, updated)
            VALUES (@Id, @AreaId, @UserId, @VerbId, @Summary, @Note, @Started, @Ended, 
                    @DurationSec, @VisibilityId, @Context, @IsActive, @Created, @Updated)
            RETURNING id";
        
        entity.Id = entity.Id == Guid.Empty ? Guid.NewGuid() : entity.Id;
        EnsureValidConnection(connection);
        return await connection.ExecuteScalarAsync<Guid>(sql, entity);
    }

    public override async Task<int> UpdateAsync(ActionEntity entity, CancellationToken cancellationToken, IDbConnection connection)
    {
        const string sql = @"
            UPDATE actions SET 
                verb_id = @VerbId, summary = @Summary, note = @Note, started = @Started, 
                ended = @Ended, duration_sec = @DurationSec, visibility_id = @VisibilityId, 
                context = @Context, is_active = @IsActive, updated = @Updated
            WHERE id = @Id";
        
        EnsureValidConnection(connection);
        return await connection.ExecuteAsync(sql, entity);
    }

    public async Task<IEnumerable<ActionEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        const string sql = @"
            SELECT id, area_id, user_id, verb_id, summary, note, started, ended, duration_sec, 
                   visibility_id, context, is_active, deactivated, created, updated
            FROM actions 
            WHERE area_id = @AreaId AND is_active = true
            ORDER BY started DESC";
        
        return await connection.QueryAsync<ActionEntity>(sql, new { AreaId = areaId });
    }

    public async Task<IEnumerable<ActionEntity>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        const string sql = @"
            SELECT id, area_id, user_id, verb_id, summary, note, started, ended, duration_sec, 
                   visibility_id, context, is_active, deactivated, created, updated
            FROM actions 
            WHERE user_id = @UserId AND is_active = true
            ORDER BY started DESC";
        
        return await connection.QueryAsync<ActionEntity>(sql, new { UserId = userId });
    }

    public async Task<IEnumerable<ActionEntity>> GetByTimeRangeAsync(DateTimeOffset from, DateTimeOffset to, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        const string sql = @"
            SELECT id, area_id, user_id, verb_id, summary, note, started, ended, duration_sec, 
                   visibility_id, context, is_active, deactivated, created, updated
            WHERE started >= @From AND started <= @To AND is_active = true
            ORDER BY started DESC";
        
        return await connection.QueryAsync<ActionEntity>(sql, new { From = from, To = to });
    }

    public async Task<IEnumerable<ActionEntity>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        const string sql = @"
            SELECT id, area_id, user_id, verb_id, summary, note, started, ended, duration_sec, 
                   visibility_id, context, is_active, deactivated, created, updated
            FROM actions 
            WHERE is_active = true
            ORDER BY started DESC";
        
        return await connection.QueryAsync<ActionEntity>(sql);
    }
}
