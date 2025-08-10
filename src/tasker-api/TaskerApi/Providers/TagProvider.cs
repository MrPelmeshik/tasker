using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Entities;
using TaskerApi.Infrastructure;

namespace TaskerApi.Providers;

public class TagProvider : BaseProvider<TagEntity, Guid>, ITagProvider
{
    public TagProvider(IUnitOfWorkFactory unitOfWorkFactory) : base(unitOfWorkFactory)
    {
    }

    public async Task<IEnumerable<TagEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT id, area_id, slug, label, is_active, deactivated, created, updated
            FROM tags 
            WHERE area_id = @AreaId AND is_active = true
            ORDER BY created DESC";
        
        return await connection.QueryAsync<TagEntity>(sql, new { AreaId = areaId });
    }

    public async Task<IEnumerable<TagEntity>> GetByActionAsync(Guid actionId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT t.id, t.area_id, t.slug, t.label, t.is_active, t.deactivated, t.created, t.updated
            FROM tags t
            INNER JOIN action_tag at ON t.id = at.tag_id
            WHERE at.action_id = @ActionId AND t.is_active = true AND at.is_active = true
            ORDER BY t.created DESC";
        
        return await connection.QueryAsync<TagEntity>(sql, new { ActionId = actionId });
    }

    public async Task<TagEntity?> GetBySlugAsync(Guid areaId, string slug, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT id, area_id, slug, label, is_active, deactivated, created, updated
            FROM tags 
            WHERE area_id = @AreaId AND slug = @Slug AND is_active = true";
        
        return await connection.QueryFirstOrDefaultAsync<TagEntity>(sql, new { AreaId = areaId, Slug = slug });
    }

    public async Task<IEnumerable<TagEntity>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT id, area_id, slug, label, is_active, deactivated, created, updated
            FROM tags 
            WHERE is_active = true
            ORDER BY created DESC";
        
        return await connection.QueryAsync<TagEntity>(sql);
    }
}
