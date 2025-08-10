using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Entities;
using TaskerApi.Infrastructure;

namespace TaskerApi.Providers;

public class AreaMembershipProvider : BaseProvider<AreaMembershipEntity, Guid>, IAreaMembershipProvider
{
    public AreaMembershipProvider(IUnitOfWorkFactory unitOfWorkFactory) : base(unitOfWorkFactory)
    {
    }

    public async Task<IEnumerable<AreaMembershipEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT id, area_id, user_id, role, joined, is_active, created, updated
            FROM area_memberships 
            WHERE area_id = @AreaId AND is_active = true
            ORDER BY joined DESC";
        
        return await connection.QueryAsync<AreaMembershipEntity>(sql, new { AreaId = areaId });
    }

    public async Task<IEnumerable<AreaMembershipEntity>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT id, area_id, user_id, role, joined, is_active, created, updated
            FROM area_memberships 
            WHERE user_id = @UserId AND is_active = true
            ORDER BY joined DESC";
        
        return await connection.QueryAsync<AreaMembershipEntity>(sql, new { UserId = userId });
    }

    public async Task<AreaMembershipEntity?> GetByAreaAndUserAsync(Guid areaId, Guid userId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT id, area_id, user_id, role, joined, is_active, created, updated
            FROM area_memberships 
            WHERE area_id = @AreaId AND user_id = @UserId AND is_active = true";
        
        return await connection.QueryFirstOrDefaultAsync<AreaMembershipEntity>(sql, new { AreaId = areaId, UserId = userId });
    }
}
