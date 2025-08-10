using System.Data;
using Dapper;
using Microsoft.Extensions.Logging;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Entities;
using TaskerApi.Infrastructure;

namespace TaskerApi.Providers;

public class UserActionLogProvider : BaseProvider<UserActionLogEntity, Guid>, IUserActionLogProvider
{
    public UserActionLogProvider(IUnitOfWorkFactory unitOfWorkFactory) : base(unitOfWorkFactory)
    {
    }

    public async Task<IEnumerable<UserActionLogEntity>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT id, user_id, action, details, ip_address, user_agent, created
            FROM user_action_logs 
            WHERE user_id = @UserId
            ORDER BY created DESC";
        
        return await connection.QueryAsync<UserActionLogEntity>(sql, new { UserId = userId });
    }

    public async Task<IEnumerable<UserActionLogEntity>> GetByTimeRangeAsync(DateTimeOffset from, DateTimeOffset to, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT id, user_id, action, details, ip_address, user_agent, created
            FROM user_action_logs 
            WHERE created >= @From AND created <= @To
            ORDER BY created DESC";
        
        return await connection.QueryAsync<UserActionLogEntity>(sql, new { From = from, To = to });
    }

    public async Task<IEnumerable<UserActionLogEntity>> GetByActionAsync(string action, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT id, user_id, action, details, ip_address, user_agent, created
            FROM user_action_logs 
            WHERE action = @Action
            ORDER BY created DESC";
        
        return await connection.QueryAsync<UserActionLogEntity>(sql, new { Action = action });
    }
}

